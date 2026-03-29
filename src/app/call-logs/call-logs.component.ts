import { Component, OnInit } from '@angular/core';
import { CallLogsService } from '../services/call-logs.service';
import { LeadsService } from '../services/leads.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

export interface CallLog {
  userName: string;
  leadName: string;
  phoneNumber: string;
  callType: string;
  callStatus: string;
  callDuration: string;
  callTime: string;
  remarks: string;
  recordingUrl?: string;
}

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.css']
})
export class CallLogsComponent implements OnInit {

  breadcrumbItems!: MenuItem[];
  home!: MenuItem;

  callLogs: CallLog[] = [];
  loading = true;

  // Manual log dialog
  showLogDialog = false;
  logForm = {
    lead_id: '',
    call_status: 'Connected',
    call_duration: null as number | null,
    remarks: ''
  };
  leads: any[] = [];

  statusOptions = [
    { label: 'Connected', value: 'Connected' },
    { label: 'Not Connected', value: 'Not Connected' }
  ];

  constructor(
    private callLogsService: CallLogsService,
    private leadsService: LeadsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [{ label: 'Call Logs' }];
    this.loadCallLogs();
  }

  loadCallLogs() {
    this.loading = true;
    this.callLogsService.getCallLogs().subscribe({
      next: (data: CallLog[]) => {
        this.callLogs = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load call logs');
        this.loading = false;
      }
    });
  }

  openLogDialog() {
    this.logForm = { lead_id: '', call_status: 'Connected', call_duration: null, remarks: '' };
    this.showLogDialog = true;

    if (this.leads.length === 0) {
      this.leadsService.getAll().subscribe({
        next: (data) => this.leads = data,
        error: () => this.leads = []
      });
    }
  }

  saveManualLog() {
    if (!this.logForm.lead_id) {
      this.toastr.warning('Please select a lead');
      return;
    }

    this.callLogsService.createManualLog(this.logForm).subscribe({
      next: () => {
        this.toastr.success('Call log created');
        this.showLogDialog = false;
        this.loadCallLogs();
      },
      error: (err) => this.toastr.error(err?.error?.error || 'Failed to create call log')
    });
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Connected':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Not Connected':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
