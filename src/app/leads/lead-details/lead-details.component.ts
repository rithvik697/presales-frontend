import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { LeadStatusHistory, StatusOption } from '../../models/lead-status-history.model';
import { AuthService } from '../../services/auth.service';
import { LeadsService } from '../../services/leads.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-lead-details',
    templateUrl: './lead-details.component.html',
    styleUrls: ['./lead-details.component.css']
})
export class LeadDetailsComponent implements OnInit {

    lead: Lead | null = null;
    loading: boolean = true;
    leadId: string = '';

    // Tabs
    activeTab: 'details' | 'history' = 'details';

    // Status history
    statusHistory: LeadStatusHistory[] = [];
    statusOptions: StatusOption[] = [];
    loadingHistory: boolean = false;

    // Dialogs
    showAddDialog: boolean = false;
    showEditDialog: boolean = false;
    showDeleteConfirmation: boolean = false;
    entryToDelete: LeadStatusHistory | null = null;
    entryToEdit: LeadStatusHistory | null = null;

    // Form
    newStatusId: string = '';
    newRemarks: string = '';
    editRemarks: string = '';

    // Auth
    isAdmin: boolean = false;
    currentUser: string = '';

    // Breadcrumb
    breadcrumbItems: MenuItem[] = [];
    home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private leadsService: LeadsService,
        private toastr: ToastrService
    ) {}

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
                this.statusHistory = data;
                this.loadingHistory = false;
            },
            error: () => {
                this.statusHistory = [];
                this.loadingHistory = false;
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

    goBack(): void {
        this.router.navigate(['/leads']);
    }

    editLead(): void {
        this.router.navigate(['/leads/edit', this.leadId]);
    }

    // ─── Add Status Change ───

    openAddDialog(): void {
        this.newStatusId = '';
        this.newRemarks = '';
        this.showAddDialog = true;
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
}