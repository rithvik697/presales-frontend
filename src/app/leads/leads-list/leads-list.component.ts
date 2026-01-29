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

  // Dynamic dropdown values
  sourceOptions: string[] = [];
  projectOptions: string[] = [];
  statusOptions: string[] = [];
  employeeOptions: string[] = [];

  // Filter form
  filterForm: FormGroup;

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
    this.loadLeads();
  }

  toggleFilterView(): void {
    this.showFilterView = !this.showFilterView;
    this.leadsService.filterViewOpen = this.showFilterView;
  }

  loadLeads(): void {
    const sub = this.leadsService.getAll().subscribe((data) => {
      this.allLeads = data;
      this.filteredLeads = data;
      this.extractDropdownValues();
    });
    this.subscriptions.push(sub);
  }

  extractDropdownValues(): void {
    // Extract unique values from leads array
    this.sourceOptions = [...new Set(this.allLeads.map(l => l.source).filter((s): s is string => !!s))].sort();
    this.projectOptions = [...new Set(this.allLeads.map(l => l.project).filter((p): p is string => !!p))].sort();
    this.statusOptions = [...new Set(this.allLeads.map(l => l.status).filter((s): s is string => !!s))].sort();
    this.employeeOptions = [...new Set(this.allLeads.map(l => l.assignedTo).filter((e): e is string => !!e))].sort();
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
      // Assuming lead.createdAt is a string like 'YYYY-MM-DD' or similar that matches input type='date'
      if (filters.scheduledDate && !lead.createdAt?.startsWith(filters.scheduledDate)) {
        return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterText = '';
    this.filteredLeads = this.allLeads;
  }

  goToCreate(): void {
    this.router.navigate(['/leads/create']);
  }

  edit(lead: Lead) {
    // navigate to edit page later
    console.log('edit', lead);
  }

  delete(lead: Lead) {
    // call service delete later
    console.log('delete', lead);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}