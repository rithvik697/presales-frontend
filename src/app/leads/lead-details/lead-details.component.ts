import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { LeadStatusHistory, StatusOption } from '../../models/lead-status-history.model';
import { AuthService } from '../../services/auth.service';
import { LeadsService } from '../../services/leads.service';
import { CallLogsService } from '../../services/call-logs.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

interface LeadCallHistoryEntry {
    callId: number;
    callDate: string;
    startTime: string | null;
    endTime: string | null;
    duration: string;
    callStatus: string;
    callSource: string;
    callTime: string;
    madeBy: string;
    remarks: string;
    recordingUrl?: string;
}

@Component({
    selector: 'app-lead-details',
    templateUrl: './lead-details.component.html',
    styleUrls: ['./lead-details.component.css']
})
export class LeadDetailsComponent implements OnInit {

    @ViewChild('historyTimeline') historyTimeline?: ElementRef<HTMLDivElement>;

    lead: Lead | null = null;
    loading: boolean = true;
    leadId: string = '';

    // Tabs
    activeTab: 'details' | 'history' | 'calls' = 'details';

    // Status history
    statusHistory: LeadStatusHistory[] = [];
    statusOptions: StatusOption[] = [];
    loadingHistory: boolean = false;
    callHistory: LeadCallHistoryEntry[] = [];
    loadingCalls: boolean = false;

    // Dialogs
    showAddDialog: boolean = false;
    showScheduleActivityDialog: boolean = false;
    showEditDialog: boolean = false;
    showDeleteConfirmation: boolean = false;
    entryToDelete: LeadStatusHistory | null = null;
    entryToEdit: LeadStatusHistory | null = null;

    // Form
    newStatusId: string = '';
    newRemarks: string = '';
    scheduledStatusId: string = '';
    scheduledActivityDate: string = '';
    scheduledActivityTime: string = '';
    scheduledActivityRemarks: string = '';
    newCommentText: string = '';
    editRemarks: string = '';

    // Recording playback
    playingCallId: number | null = null;
    playingElapsed: string = '0:00';
    private audioPlayer: HTMLAudioElement | null = null;
    private elapsedTimer: any = null;

    // Auth
    isAdmin: boolean = false;
    currentUser: string = '';
    private readonly phoneCountryCodes = ['+91', '+1', '+44', '+61', '+86'];

    // Breadcrumb
    breadcrumbItems: MenuItem[] = [];
    home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private leadsService: LeadsService,
        private callLogsService: CallLogsService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.getRole() === 'ADMIN';
        this.currentUser = this.authService.getUsername() || '';

        this.leadId = this.route.snapshot.paramMap.get('id') || '';
        if (!this.leadId) {
            this.router.navigate(['/leads']);
            return;
        }

        this.loadLead();
        this.loadStatusOptions();
        this.loadHistory();
        this.loadCallHistory();
    }

    // ─── Data Loading ───

    loadLead(): void {
        this.loading = true;
        this.leadsService.getById(this.leadId).subscribe({
            next: (lead) => {
                this.lead = lead;
                this.loading = false;
                this.breadcrumbItems = [
                    { label: 'Leads', routerLink: '/leads' },
                    { label: lead.name || 'Lead Details' }
                ];
            },
            error: () => {
                this.toastr.error('Failed to load lead');
                this.loading = false;
                this.router.navigate(['/leads']);
            }
        });
    }

    loadStatusOptions(): void {
        // Uses the EXISTING endpoint: GET /api/leads/statuses
        this.leadsService.getStatuses().subscribe({
            next: (options) => this.statusOptions = options,
            error: () => this.statusOptions = []
        });
    }

    loadHistory(): void {
        if (!this.leadId) return;
        this.loadingHistory = true;
        this.leadsService.getStatusHistory(this.leadId).subscribe({
            next: (data) => {
                this.statusHistory = [...data].reverse();
                this.loadingHistory = false;
                setTimeout(() => this.scrollHistoryToBottom());
            },
            error: () => {
                this.statusHistory = [];
                this.loadingHistory = false;
            }
        });
    }

    loadCallHistory(): void {
        if (!this.leadId) return;
        this.loadingCalls = true;
        this.leadsService.getCallHistory(this.leadId).subscribe({
            next: (data) => {
                this.callHistory = data;
                this.loadingCalls = false;
            },
            error: () => {
                this.callHistory = [];
                this.loadingCalls = false;
            }
        });
    }

    // ─── Helpers ───

    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    getLeadAgeDays(createdAt: string | undefined): number {
        if (!createdAt) return 0;
        return Math.ceil(Math.abs(new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }

    getLeadAge(createdAt: string | undefined): string {
        const days = this.getLeadAgeDays(createdAt);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    getStatusClass(status: string | undefined): string {
        if (!status) return 'status-default';
        const s = status.toLowerCase();
        if (s.includes('new') || s.includes('enquiry')) return 'status-new';
        if (s.includes('contact') || s.includes('active') || s.includes('call')) return 'status-active';
        if (s.includes('pipeline') || s.includes('visit') || s.includes('expected')) return 'status-pipeline';
        if (s.includes('closed') || s.includes('deal') || s.includes('won')) return 'status-closed';
        if (s.includes('lost') || s.includes('spam') || s.includes('not interested')) return 'status-lost';
        return 'status-default';
    }

    getDotClass(name: string): string {
        const s = (name || '').toLowerCase();
        if (s.includes('visit')) return 'dot-visit';
        if (s.includes('call') || s.includes('phone') || s.includes('whatsapp')) return 'dot-call';
        if (s.includes('enquir') || s.includes('new')) return 'dot-enquiry';
        if (s.includes('closed') || s.includes('deal') || s.includes('pipeline')) return 'dot-closed';
        if (s.includes('concern') || s.includes('spam') || s.includes('not')) return 'dot-concern';
        return 'dot-default';
    }

    getBadgeClass(name: string): string {
        const s = (name || '').toLowerCase();
        if (s.includes('visit')) return 'type-visit';
        if (s.includes('call') || s.includes('phone') || s.includes('whatsapp')) return 'type-call';
        if (s.includes('enquir') || s.includes('new')) return 'type-enquiry';
        if (s.includes('closed') || s.includes('deal') || s.includes('pipeline')) return 'type-closed';
        if (s.includes('concern') || s.includes('spam') || s.includes('not')) return 'type-concern';
        return 'type-default';
    }

    // ─── Navigation ───

    isAssignmentEvent(entry: LeadStatusHistory): boolean {
        return entry.event_type === 'assignment_change';
    }

    isScheduledActivityEvent(entry: LeadStatusHistory): boolean {
        return entry.event_type === 'scheduled_activity';
    }

    isCommentEvent(entry: LeadStatusHistory): boolean {
        return entry.event_type === 'comment';
    }

    getEntryCountLabel(): string {
        const count = this.statusHistory.length;
        return `${count} history ${count === 1 ? 'event' : 'events'} recorded`;
    }

    getCallCountLabel(): string {
        const count = this.callHistory.length;
        return `${count} ${count === 1 ? 'call' : 'calls'} recorded`;
    }

    getEntryDotClass(entry: LeadStatusHistory): string {
        if (this.isCommentEvent(entry)) return 'dot-comment';
        if (this.isAssignmentEvent(entry)) return 'dot-default';
        if (this.isScheduledActivityEvent(entry)) return this.getDotClass(entry.scheduled_status_name || '');
        return this.getDotClass(entry.new_status_name || '');
    }

    getEventHeading(entry: LeadStatusHistory): string {
        if (this.isScheduledActivityEvent(entry)) {
            return `${entry.scheduled_status_name || 'Activity'} Scheduled`;
        }
        if (this.isCommentEvent(entry)) return 'Comment Added';
        if (this.isAssignmentEvent(entry)) return 'Lead Reassigned';
        return '';
    }

    getScheduledActivityDisplay(entry: LeadStatusHistory): string {
        if (!entry.scheduled_at) return '';
        return new Date(entry.scheduled_at).toLocaleString();
    }

    getEntryDateLabel(entry: LeadStatusHistory): string {
        return new Date(entry.changed_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    getEntryTimeLabel(entry: LeadStatusHistory): string {
        return new Date(entry.changed_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    formatCallTime(value: string | null): string {
        if (!value) return '-';

        const raw = value.includes('T') ? value.split('T')[1] : value;
        const [hours, minutes, seconds = '00'] = raw.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes), Number(seconds), 0);

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    shouldShowDateDivider(index: number): boolean {
        if (index === 0) return true;

        const currentDate = new Date(this.statusHistory[index].changed_at).toDateString();
        const previousDate = new Date(this.statusHistory[index - 1].changed_at).toDateString();

        return currentDate !== previousDate;
    }

    scrollHistoryToBottom(): void {
        const container = this.historyTimeline?.nativeElement;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }

    goBack(): void {
        this.router.navigate(['/leads']);
    }

    editLead(): void {
        this.router.navigate(['/leads/edit', this.leadId]);
    }

    callLead(): void {
        if (!this.lead?.phone) return;

        // Mobile devices: open native dialer
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = 'tel:' + this.lead.phone;
            return;
        }

        // Desktop: use MCube Click2Call via backend
        this.callLogsService.click2Call(this.lead.phone, this.leadId).subscribe({
            next: () => {
                this.toastr.success('Call initiated successfully');
                this.loadCallHistory();
            },
            error: (err) => {
                this.toastr.error(err?.error?.error || 'Failed to initiate call');
            }
        });
    }

    // ─── Recording Playback ───

    toggleRecording(call: LeadCallHistoryEntry): void {
        if (this.playingCallId === call.callId) {
            this.stopPlayback();
            return;
        }

        this.stopPlayback();

        this.audioPlayer = new Audio(call.recordingUrl);
        this.playingCallId = call.callId;
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

    private stopPlayback(): void {
        this.audioPlayer?.pause();
        this.audioPlayer = null;
        this.playingCallId = null;
        this.playingElapsed = '0:00';
        if (this.elapsedTimer) {
            clearInterval(this.elapsedTimer);
            this.elapsedTimer = null;
        }
    }

    // ─── Add Status Change ───

    openAddDialog(): void {
        this.newStatusId = '';
        this.newRemarks = '';
        this.showAddDialog = true;
    }

    openScheduleActivityDialog(): void {
        this.scheduledStatusId = '';
        this.scheduledActivityDate = '';
        this.scheduledActivityTime = '';
        this.scheduledActivityRemarks = '';
        this.showScheduleActivityDialog = true;
    }

    saveScheduledActivity(): void {
        if (!this.leadId || !this.scheduledStatusId || !this.scheduledActivityDate || !this.scheduledActivityTime) {
            this.toastr.warning('Please select a status, date, and time');
            return;
        }

        const scheduledAt = `${this.scheduledActivityDate}T${this.scheduledActivityTime}:00`;

        this.leadsService.scheduleActivity(this.leadId, {
            status_id: this.scheduledStatusId,
            scheduled_at: scheduledAt,
            remarks: this.scheduledActivityRemarks
        }).subscribe({
            next: () => {
                this.toastr.success('Activity scheduled successfully');
                this.showScheduleActivityDialog = false;
                this.loadLead();
                this.loadHistory();
            },
            error: (err) => this.toastr.error(err?.error?.error || 'Failed to schedule activity')
        });
    }

    saveComment(): void {
        const commentText = this.newCommentText.trim();
        if (!this.leadId || !commentText) {
            this.toastr.warning('Please enter a comment');
            return;
        }

        this.leadsService.addComment(this.leadId, {
            comment_text: commentText
        }).subscribe({
            next: () => {
                this.toastr.success('Comment added');
                this.newCommentText = '';
                this.loadHistory();
            },
            error: (err) => this.toastr.error(err?.error?.error || 'Failed to add comment')
        });
    }

    saveNewStatus(): void {
        if (!this.leadId || !this.newStatusId) {
            this.toastr.warning('Please select a status');
            return;
        }
        this.leadsService.createStatusChange(this.leadId, {
            new_status_id: this.newStatusId,
            remarks: this.newRemarks
        }).subscribe({
            next: () => {
                this.toastr.success('Status updated successfully');
                this.showAddDialog = false;
                this.loadLead();    // Refresh lead to show new current status
                this.loadHistory(); // Refresh timeline
            },
            error: (err) => this.toastr.error(err?.error?.error || 'Failed to update status')
        });
    }

    // ─── Edit Remarks ───

    openEditDialog(entry: LeadStatusHistory): void {
        this.entryToEdit = entry;
        this.editRemarks = entry.remarks || '';
        this.showEditDialog = true;
    }

    saveEditRemarks(): void {
        if (!this.leadId || !this.entryToEdit) return;
        this.leadsService.updateStatusHistory(
            this.leadId, this.entryToEdit.history_id, { remarks: this.editRemarks }
        ).subscribe({
            next: () => {
                this.toastr.success('Remarks updated');
                this.showEditDialog = false;
                this.entryToEdit = null;
                this.loadHistory();
            },
            error: () => this.toastr.error('Failed to update remarks')
        });
    }

    // ─── Delete ───

    confirmDelete(entry: LeadStatusHistory): void {
        this.entryToDelete = entry;
        this.showDeleteConfirmation = true;
    }

    deleteEntry(): void {
        if (!this.leadId || !this.entryToDelete) return;
        this.leadsService.deleteStatusHistory(this.leadId, this.entryToDelete.history_id).subscribe({
            next: () => {
                this.toastr.success('Entry deleted');
                this.showDeleteConfirmation = false;
                this.entryToDelete = null;
                this.loadHistory();
            },
            error: (err) => {
                this.toastr.error(err?.error?.error || 'Failed to delete');
                this.showDeleteConfirmation = false;
            }
        });
    }

    formatPhone(value: string | null | undefined): string {
        if (!value) return '-';
        let raw = String(value).trim();

        // Auto-normalize legacy Indian numbers starting with '91' without '+'
        if (!raw.startsWith('+') && raw.startsWith('91') && raw.length === 12) {
            raw = '+' + raw;
        }

        const matchedCode = [...this.phoneCountryCodes]
            .sort((a, b) => b.length - a.length)
            .find((code) => raw.startsWith(code));

        if (!matchedCode) return raw;

        const localNumber = raw.slice(matchedCode.length).trim();
        if (!localNumber) return matchedCode;

        // Symmetric alignment: hide +91 for India numbers in tables/details
        if (matchedCode === '+91') {
            return localNumber;
        }
        return `${matchedCode} ${localNumber}`;
    }
}