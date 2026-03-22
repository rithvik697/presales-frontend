import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { LeadsService } from '../../services/leads.service';
import { Lead } from '../../models/lead.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css'],
})
export class LeadsListComponent implements OnInit, OnDestroy {
  allLeads: Lead[] = [];
  filteredLeads: Lead[] = [];
  private subscriptions: Subscription[] = [];
  showFilterView = false; // Toggle for filter panel
  loading: boolean = true;

  // Breadcrumbs
  breadcrumbItems: any[] = [];
  home: any;

  // Dynamic dropdown values
  sourceOptions: string[] = [];
  projectOptions: string[] = [];
  statusOptions: string[] = [];
  employeeOptions: string[] = [];

  // Lead Overview Modal
  showLeadDetails: boolean = false;
  selectedLead: Lead | null = null;
  currentDashboardFilter: string | null = null;

  // Filter form
  filterForm: FormGroup;

  // Column Dynamic Selection
  showColumnPicker = false;
  allOptionalCols: any[] = [];
  selectedOptionalCols: any[] = [];
  activeCols: any[] = [];

  // Main fields that are always visible
  mainCols: any[] = [
    { field: 'id', header: 'Lead ID' },
    { field: 'name', header: 'Name' },
    { field: 'phone', header: 'Phone' },
    { field: 'project', header: 'Project' },
    { field: 'source', header: 'Source' },
    { field: 'description', header: 'Remarks' }
  ];

  // PrimeNG Table Cols
  cols: any[] = [];

  private readonly terminalStatuses = new Set([
    'Deal Closed',
    'Spam',
    'Low Budget',
    'OOS',
    'Old Lead',
    'Not Interested'
  ]);

  private readonly pendingStatuses = new Set([
    'Follow-up',
    'Re-Enquire',
    'Expected Site Visit',
    'Expected Office Visit',
    'Not Answered'
  ]);

  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = new FormGroup({
      customerName: new FormControl(''),
      mobileNumber: new FormControl(''),
      source: new FormControl(''),
      project: new FormControl(''),
      status: new FormControl(''),
      assignedEmployee: new FormControl(''),
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
    });
  }

  ngOnInit(): void {
    // Setup breadcrumbs
    this.setupBreadcrumbs();

    // Restore state from service
    this.showFilterView = this.leadsService.filterViewOpen;

    // Initialize Optional Columns
    this.allOptionalCols = [
      { field: 'assignedTo', header: 'Assigned To' },
      { field: 'status', header: 'Status' },
      { field: 'createdAt', header: 'Created On' },
      { field: 'modifiedAt', header: 'Modified On' },
      { field: 'actions', header: 'Actions' }
    ];

    // Default: Show ONLY main fields initially
    this.selectedOptionalCols = [];

    this.applyColumns();
    this.watchDashboardFilters();
    this.loadLeads();
    this.loadEmployees();
    this.loadProjects();
    this.loadSources();
    this.loadStatuses();
  }

  setupBreadcrumbs(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [{ label: 'Leads' }];
  }

  applyColumns(): void {
    // Combine main cols with selected optional cols
    this.activeCols = [...this.mainCols, ...this.selectedOptionalCols];
    this.showColumnPicker = false;
  }

  resetColumns(): void {
    this.selectedOptionalCols = []; // Start with only main fields
    this.applyColumns();
  }

  toggleColumnPicker(): void {
    const activeFieldNames = this.activeCols.map(c => c.field);
    this.selectedOptionalCols = this.allOptionalCols.filter(col => activeFieldNames.includes(col.field));
    this.showColumnPicker = !this.showColumnPicker;
  }

  selectAllColumns(): void {
    this.selectedOptionalCols = [...this.allOptionalCols];
  }

  unselectAllColumns(): void {
    this.selectedOptionalCols = [];
  }

  toggleFilterView(): void {
    this.showFilterView = !this.showFilterView;
    this.leadsService.filterViewOpen = this.showFilterView;
  }

  loadLeads(): void {
    this.loading = true;
    const sub = this.leadsService.getAll().subscribe((data) => {
      this.allLeads = data;
      this.filteredLeads = data;
      this.extractDropdownValues();
      this.applyFilters();
      this.loading = false;
    });
    this.subscriptions.push(sub);
  }

  watchDashboardFilters(): void {
    const sub = this.route.queryParams.subscribe((params) => {
      this.currentDashboardFilter = params['dashboardFilter'] || null;
      const status = params['status'] || '';

      this.filterForm.patchValue(
        {
          status
        },
        { emitEvent: false }
      );

      if (this.currentDashboardFilter || status) {
        this.showFilterView = true;
        this.leadsService.filterViewOpen = true;
      }

      if (this.allLeads.length) {
        this.applyFilters();
      }
    });

    this.subscriptions.push(sub);
  }

  loadEmployees(): void {
    const sub = this.leadsService.getEmployees().subscribe((data: any[]) => {
      // Backend returns array of objects with emp_id and full_name
      this.employeeOptions = data.map(e => e.full_name).sort();
    });
    this.subscriptions.push(sub);
  }

  loadProjects(): void {
    const sub = this.leadsService.getProjects().subscribe((data) => {
      this.projectOptions = data.map(p => p.project_name).sort();
    });
    this.subscriptions.push(sub);
  }

  loadSources(): void {
    const sub = this.leadsService.getSources().subscribe((data) => {
      this.sourceOptions = data.map(s => s.source_name).sort();
    });
    this.subscriptions.push(sub);
  }

  loadStatuses(): void {
    const sub = this.leadsService.getStatuses().subscribe((data) => {
      this.statusOptions = data.map(s => s.status_name).sort();
    });
    this.subscriptions.push(sub);
  }

  extractDropdownValues(): void {
    // Dropdown values are now predominantly fetched directly from DB.
    // We only perform fallback/extraction if necessary for values not in DB but in current list.
    const currentSources = new Set(this.allLeads.map(l => l.source).filter((s): s is string => !!s));
    this.sourceOptions = [...new Set([...this.sourceOptions, ...currentSources])].sort();

    const currentStatuses = new Set(this.allLeads.map(l => l.status).filter((s): s is string => !!s));
    this.statusOptions = [...new Set([...this.statusOptions, ...currentStatuses])].sort();
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.filteredLeads = this.allLeads.filter(lead => {
      // Customer Name filter
      if (filters.customerName && !lead.name.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      // Mobile Number filter
      if (filters.mobileNumber && !lead.phone.includes(filters.mobileNumber)) {
        return false;
      }

      // Source filter
      if (filters.source && lead.source !== filters.source) {
        return false;
      }

      // Project filter
      if (filters.project && lead.project !== filters.project) {
        return false;
      }

      // Status filter
      if (filters.status && lead.status !== filters.status) {
        return false;
      }

      // Assigned Employee filter (Fuzzy Match)
      if (filters.assignedEmployee) {
        const leadAssigned = (lead.assignedTo || '').toLowerCase();
        const filterAssigned = filters.assignedEmployee.toLowerCase();
        if (!leadAssigned.includes(filterAssigned) && !filterAssigned.includes(leadAssigned)) {
          return false;
        }
      }

      // Scheduled Date filter
      // Assuming lead.createdAt varies format. Simple string match for now as per previous logic.
      // Better to check date equality if needed.
      if (filters.fromDate || filters.toDate) {

        if (!lead.createdAt) return false;

        const leadDate = new Date(lead.createdAt);
        leadDate.setHours(0, 0, 0, 0);

        if (filters.fromDate) {
          const from = new Date(filters.fromDate);
          from.setHours(0, 0, 0, 0);

          if (leadDate < from) return false;
        }

        if (filters.toDate) {
          const to = new Date(filters.toDate);
          to.setHours(23, 59, 59, 999);

          if (leadDate > to) return false;
        }
      }

      if (this.currentDashboardFilter === 'active' && !this.isActiveLead(lead)) {
        return false;
      }

      if (this.currentDashboardFilter === 'pending' && !this.isPendingLead(lead)) {
        return false;
      }

      return true;
    });
  }

  clearFilters(dt?: any): void {
    this.filterForm.reset();
    this.currentDashboardFilter = null;
    this.filteredLeads = this.allLeads;
    this.router.navigate(['/leads']);
    if (dt) {
      dt.clear(); // Clears PrimeNG table internal filters/sorting
    }
  }

  viewLead(lead: Lead): void {
    this.router.navigate(['/leads/details', lead.id]);
  }

  goToCreate(): void {
    this.router.navigate(['/leads/create']);
  }

  edit(lead: Lead) {
    this.router.navigate(['/leads/edit', lead.id]);
  }

  delete(lead: Lead) {
    // call service delete later
    if (confirm('Are you sure you want to delete this lead?')) {
      this.leadsService.delete(String(lead.id)).subscribe(() => {
        this.loadLeads(); // Reload
      });
    }
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'New':
        return 'info';
      case 'Contacted':
        return 'warning';
      case 'Qualified':
        return 'success';
      case 'Lost':
        return 'danger';
      case 'Converted':
        return 'success';
      default:
        return 'info';
    }
  }

  private isActiveLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return !!status && !this.terminalStatuses.has(status);
  }

  private isPendingLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return this.pendingStatuses.has(status);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}