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

  // Recording playback
  playingRecordingUrl: string | null = null;
  playingElapsed: string = '0:00';
  private audioPlayer: HTMLAudioElement | null = null;
  private elapsedTimer: any = null;

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

  toggleRecording(log: CallLog) {
    if (this.playingRecordingUrl === log.recordingUrl) {
      this.stopPlayback();
      return;
    }

    this.stopPlayback();

    this.audioPlayer = new Audio(log.recordingUrl);
    this.playingRecordingUrl = log.recordingUrl!;
    this.playingElapsed = '0:00';
    this.audioPlayer.play().catch(() => {
      this.toastr.error('Unable to play recording');
      this.stopPlayback();
    });
    this.elapsedTimer = setInterval(() => {
      if (this.audioPlayer) {
        const s = Math.floor(this.audioPlayer.currentTime);
        this.playingElapsed = `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
      }
    }, 500);
    this.audioPlayer.onended = () => this.stopPlayback();
  }

  private stopPlayback() {
    this.audioPlayer?.pause();
    this.audioPlayer = null;
    this.playingRecordingUrl = null;
    this.playingElapsed = '0:00';
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
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
