import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ConfigureService,
  LeadSourceOption,
  LeadStatusOption,
  LeadTransferHistoryItem,
  ProjectOption,
  SalesExecutiveOption
} from '../../services/configure.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lead-transfer',
  templateUrl: './lead-transfer.component.html',
  styleUrls: ['./lead-transfer.component.css']
})
export class LeadTransferComponent implements OnInit {
  fromEmployees: SalesExecutiveOption[] = [];
  toEmployees: SalesExecutiveOption[] = [];
  projects: ProjectOption[] = [];
  sources: LeadSourceOption[] = [];
  statuses: LeadStatusOption[] = [];
  history: LeadTransferHistoryItem[] = [];
  dateTypes = [
    { value: 'created_on', label: 'Created Date' },
    { value: 'modified_on', label: 'Modified Date' }
  ];

  fromEmpId = '';
  toEmpId = '';
  fromProjectId = '';
  fromSourceId = '';
  fromStatusId = '';
  toProjectId = '';
  toSourceId = '';
  toStatusId = '';
  dateType = 'created_on';
  fromDate = '';
  toDate = '';
  transferLimit: number | null = null;

  availableLeadCount = 0;
  previewLoading = false;
  transferLoading = false;
  historyLoading = false;

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.configureService.getSalesExecutives(false).subscribe({
      next: (users) => this.fromEmployees = users,
      error: () => this.toastr.error('Failed to load source employees')
    });

    forkJoin({
      salesExecutives: this.configureService.getSalesExecutives(true),
      admins: this.configureService.getAdmins(true)
    }).subscribe({
      next: ({ salesExecutives, admins }) => {
        this.toEmployees = [...salesExecutives, ...admins].sort((a, b) =>
          a.full_name.localeCompare(b.full_name)
        );
      },
      error: () => this.toastr.error('Failed to load target employees')
    });

    this.configureService.getProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: () => this.toastr.error('Failed to load projects')
    });

    this.configureService.getLeadSources().subscribe({
      next: (sources) => this.sources = sources,
      error: () => this.toastr.error('Failed to load sources')
    });

    this.configureService.getLeadStatuses().subscribe({
      next: (statuses) => this.statuses = statuses,
      error: () => this.toastr.error('Failed to load statuses')
    });

    this.loadHistory();
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.configureService.getLeadTransferHistory().subscribe({
      next: (history) => {
        this.history = history;
        this.historyLoading = false;
      },
      error: (err) => {
        this.historyLoading = false;
        this.toastr.error(err?.error?.error || 'Failed to load transfer history');
      }
    });
  }

  previewTransfer(): void {
    if (!this.fromEmpId) {
      this.toastr.warning('Please select the employee to transfer leads from');
      return;
    }

    this.previewLoading = true;
    this.configureService.previewLeadTransfer({
      from_emp_id: this.fromEmpId,
      from_project_id: this.fromProjectId || undefined,
      from_source_id: this.fromSourceId || undefined,
      from_status_id: this.fromStatusId || undefined,
      date_type: this.dateType || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined
    }).subscribe({
      next: (result) => {
        this.availableLeadCount = result.lead_count || 0;
        this.previewLoading = false;
      },
      error: (err) => {
        this.previewLoading = false;
        this.toastr.error(err?.error?.error || 'Failed to preview lead transfer');
      }
    });
  }

  runTransfer(): void {
    if (!this.fromEmpId || !this.toEmpId) {
      this.toastr.warning('Please select both from and to employees');
      return;
    }

    if (this.fromEmpId === this.toEmpId) {
      this.toastr.warning('Please select different employees');
      return;
    }

    this.transferLoading = true;
    this.configureService.transferLeads({
      from_emp_id: this.fromEmpId,
      to_emp_id: this.toEmpId,
      from_project_id: this.fromProjectId || undefined,
      from_source_id: this.fromSourceId || undefined,
      from_status_id: this.fromStatusId || undefined,
      to_project_id: this.toProjectId || undefined,
      to_source_id: this.toSourceId || undefined,
      to_status_id: this.toStatusId || undefined,
      date_type: this.dateType || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined,
      limit: this.transferLimit || undefined
    }).subscribe({
      next: (result) => {
        this.toastr.success(`${result.lead_count} lead(s) transferred successfully`);
        this.availableLeadCount = 0;
        this.transferLimit = null;
        this.transferLoading = false;
        this.loadHistory();
      },
      error: (err) => {
        this.transferLoading = false;
        this.toastr.error(err?.error?.error || 'Failed to transfer leads');
      }
    });
  }

  resetFilters(): void {
    this.fromEmpId = '';
    this.toEmpId = '';
    this.fromProjectId = '';
    this.fromSourceId = '';
    this.fromStatusId = '';
    this.toProjectId = '';
    this.toSourceId = '';
    this.toStatusId = '';
    this.dateType = 'created_on';
    this.fromDate = '';
    this.toDate = '';
    this.transferLimit = null;
    this.availableLeadCount = 0;
  }
}
