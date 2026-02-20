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
    isAdmin: boolean = false;
    currentUser: string = '';

    activityHistory = [
        { requirement: 'Not Found', type: 'Site Visit done', date: '2024-12-03', updatedBy: 'Prakash' }
    ];

    activityTypes = ['OOS', 'OTP', 'NRI', 'Re-Enquire', 'Offline', 'Site Visit Done'];
    employeeOptions: string[] = [];

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
            next: (res) => {
                // Combine employees with current user and remove duplicates
                const all = new Set([this.currentUser, ...res]);
                this.employeeOptions = Array.from(all);
            },
            error: () => this.employeeOptions = [this.currentUser]
        });
    }

    openEdit() {
        const today = new Date().toISOString().split('T')[0];
        this.editData = {
            requirement: this.lead?.description || 'New Requirement', // Default or could be lead description
            activityType: 'Site Visit Done',
            activityDate: today,
            updatedBy: this.currentUser
        };
        this.showEditActivity = true;
    }

    saveActivity() {
        console.log('Saving Activity:', this.editData);
        // Update local history for demo purposes
        this.activityHistory.unshift({
            requirement: this.editData.requirement,
            type: this.editData.activityType,
            date: this.editData.activityDate,
            updatedBy: this.editData.updatedBy
        });
        this.showEditActivity = false;
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
