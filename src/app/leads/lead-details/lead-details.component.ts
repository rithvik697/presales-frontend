import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Lead } from '../../models/lead.model';
import { AuthService } from '../../services/auth.service';
import { LeadsService } from '../../services/leads.service';

@Component({
    selector: 'app-lead-details',
    templateUrl: './lead-details.component.html',
    styleUrls: ['./lead-details.component.css']
})
export class LeadDetailsComponent implements OnInit {
    @Input() lead: Lead | null = null;
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    showEditActivity: boolean = false;
    showDeleteConfirmation: boolean = false;
    activityToDeleteIndex: number | null = null;
    editingIndex: number | null = null;
    isAdmin: boolean = false;
    currentUser: string = '';

    activityHistory = [
        { requirement: 'Not Found', type: 'Site Visit done', date: '2024-12-03', updatedBy: 'Prakash' }
    ];

    activityTypes: any[] = [
        { label: 'New Enquiry', value: 'New Enquiry' },
        { label: 'Phone Call', value: 'Phone Call' },
        { label: 'WhatsApp', value: 'WhatsApp' },
        { label: 'Offline Lead', value: 'Offline Lead' },
        { label: 'NRI', value: 'NRI' },
        { label: 'Re-Enquire', value: 'Re-Enquire' },
        { label: 'Expected Site Visit', value: 'Expected Site Visit' },
        { label: 'Site Visit Done', value: 'Site Visit Done' },
        { label: 'Expected Office Visit', value: 'Expected Office Visit' },
        { label: 'Office Visit Done', value: 'Office Visit Done' },
        { label: 'Pipeline', value: 'Pipeline' },
        { label: 'Deal Closed', value: 'Deal Closed' },
        { label: 'Sq. Yards Concern', value: 'Sq. Yards Concern' },
        { label: 'Sq. Feet Concern', value: 'Sq. Feet Concern' },
        { label: 'Distance Concern', value: 'Distance Concern' },
        { label: 'OTP', value: 'OTP' },
        { label: '50:50', value: '50:50' },
        { label: 'Pre-Launch', value: 'Pre-Launch' },
        { label: 'Not Answered', value: 'Not Answered' },
        { label: 'Not Interested', value: 'Not Interested' },
        { label: 'Spam', value: 'Spam' },
        { label: 'Low Budget', value: 'Low Budget' },
        { label: 'OOS', value: 'OOS' },
        { label: 'Old Leads', value: 'Old Leads' }
    ];
    employeeOptions: any[] = [];

    editData = {
        requirement: 'Not Found',
        activityType: 'Site Visit done',
        activityDate: new Date().toISOString().split('T')[0],
        updatedBy: ''
    };

    constructor(
        private authService: AuthService,
        private leadsService: LeadsService
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.getRole() === 'ADMIN';
        this.currentUser = this.authService.getUsername() || 'System';
        this.loadEmployees();
    }

    loadEmployees() {
        this.leadsService.getEmployees().subscribe({
            next: (res: any[]) => {
                this.employeeOptions = res.map(e => ({ label: e.full_name, value: e.full_name }));
            },
            error: () => this.employeeOptions = [{ label: this.currentUser, value: this.currentUser }]
        });
    }

    openEdit(index?: number) {
        const today = new Date().toISOString().split('T')[0];

        if (index !== undefined) {
            // Edit Mode
            this.editingIndex = index;
            const act = this.activityHistory[index];
            this.editData = {
                requirement: act.requirement,
                activityType: act.type,
                activityDate: act.date,
                updatedBy: act.updatedBy
            };
        } else {
            // Add Mode
            this.editingIndex = null;
            this.editData = {
                requirement: this.lead?.description || 'New Requirement',
                activityType: 'Site Visit Done',
                activityDate: today,
                updatedBy: this.currentUser
            };
        }
        this.showEditActivity = true;
    }

    saveActivity() {
        const activity = {
            requirement: this.editData.requirement,
            type: this.editData.activityType,
            date: this.editData.activityDate,
            updatedBy: this.editData.updatedBy
        };

        if (this.editingIndex !== null) {
            // Update existing
            this.activityHistory[this.editingIndex] = activity;
        } else {
            // Add new
            this.activityHistory.unshift(activity);
        }

        this.showEditActivity = false;
        this.editingIndex = null;
    }

    confirmDelete(index: number) {
        this.activityToDeleteIndex = index;
        this.showDeleteConfirmation = true;
    }

    deleteActivity() {
        if (this.activityToDeleteIndex !== null) {
            this.activityHistory.splice(this.activityToDeleteIndex, 1);
            this.activityToDeleteIndex = null;
            this.showDeleteConfirmation = false;
        }
    }

    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    getLeadAge(createdAt: string | undefined): string {
        if (!createdAt) return '0';
        const createdDate = new Date(createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
    }
}
