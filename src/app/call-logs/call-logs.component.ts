import { Component, OnInit } from '@angular/core';
import { CallLogsService } from '../services/call-logs.service';
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

  constructor(private callLogsService: CallLogsService) {}

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [{ label: 'Call Logs' }];
    this.loadCallLogs();
  }

  loadCallLogs() {
    this.callLogsService.getCallLogs().subscribe({
      next: (data: CallLog[]) => {
        console.log('API DATA:', data); // sanity check
        this.callLogs = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Connected':
        return 'success';
      case 'Completed':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
