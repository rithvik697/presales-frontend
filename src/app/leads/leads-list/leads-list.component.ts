import { Component, OnInit, OnDestroy } from '@angular/core';
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
  filterText = '';
  private subscriptions: Subscription[] = [];
  showFilterView = false; // Toggle for filter panel
  loading: boolean = true;

  // Dynamic dropdown values
  sourceOptions: string[] = [];
  projectOptions: string[] = [];
  statusOptions: string[] = [];
  employeeOptions: string[] = [];

  // Lead Overview Modal
  showLeadDetails: boolean = false;
  selectedLead: Lead | null = null;

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
    { field: 'source', header: 'Source' }
  ];

  // PrimeNG Table Cols
  cols: any[] = [];

  constructor(private leadsService: LeadsService, private router: Router) {
    this.filterForm = new FormGroup({
      customerName: new FormControl(''),
      mobileNumber: new FormControl(''),
      source: new FormControl(''),
      project: new FormControl(''),
      status: new FormControl(''),
      assignedEmployee: new FormControl(''),
      scheduledDate: new FormControl(''),
    });
  }

  ngOnInit(): void {
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

    // Predefine status options for filtering
    this.statusOptions = [
      'New Enquiry', 'Phone Call', 'WhatsApp', 'Offline Lead', 'NRI',
      'Re-Enquire', 'Expected Site Visit', 'Site Visit Done',
      'Expected Office Visit', 'Office Visit Done', 'Pipeline',
      'Deal Closed', 'Sq. Yards Concern', 'Sq. Feet Concern',
      'Distance Concern', 'OTP', '50:50', 'Pre-Launch',
      'Not Answered', 'Not Interested', 'Spam', 'Low Budget',
      'OOS', 'Old Leads'
    ];

    // Default: Show ONLY main fields initially as requested
    this.selectedOptionalCols = [];

    this.applyColumns();
    this.loadLeads();
    this.loadEmployees();
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
      this.loading = false;
    });
    this.subscriptions.push(sub);
  }

  loadEmployees(): void {
    const sub = this.leadsService.getEmployees().subscribe((data) => {
      this.employeeOptions = data;
    });
    this.subscriptions.push(sub);
  }

  extractDropdownValues(): void {
    // Extract unique values from leads array and combine with predefined if needed
    const currentSources = new Set(this.allLeads.map(l => l.source).filter((s): s is string => !!s));
    this.sourceOptions = [...currentSources].sort();

    const currentProjects = new Set(this.allLeads.map(l => l.project).filter((p): p is string => !!p));
    this.projectOptions = [...currentProjects].sort();

    // For status, keep our predefined comprehensive list but ensure it's sorted or includes current ones
    const currentStatuses = new Set(this.allLeads.map(l => l.status).filter((s): s is string => !!s));
    // Add current ones to our list if not already there
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

      // Assigned Employee filter
      if (filters.assignedEmployee && lead.assignedTo !== filters.assignedEmployee) {
        return false;
      }

      // Scheduled Date filter
      // Assuming lead.createdAt varies format. Simple string match for now as per previous logic.
      // Better to check date equality if needed.
      if (filters.scheduledDate) {
        // Convert input date to comparable string or match
        // Note: input type=date gives YYYY-MM-DD
        // lead.createdAt might be full timestamp. 
        // Simple includes check as placeholder or previous behavior logic
        if (lead.createdAt && !lead.createdAt.toString().includes(filters.scheduledDate)) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(dt?: any): void {
    this.filterForm.reset();
    this.filterText = '';
    this.filteredLeads = this.allLeads;
    if (dt) {
      dt.clear(); // Clears PrimeNG table internal filters/sorting
    }
  }

  viewLead(lead: Lead): void {
    this.selectedLead = lead;
    this.showLeadDetails = true;
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

