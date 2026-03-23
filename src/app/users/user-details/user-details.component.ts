import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Lead } from '../../models/lead.model';
import { LeadsService } from '../../services/leads.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailsComponent implements OnInit {
  empId!: string;
  user: any;
  loading = true;
  assignedLeads: Lead[] = [];

  leadSummary = {
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
    lost: 0
  };

  private readonly terminalStatuses = new Set([
    'Deal Closed',
    'Spam',
    'Low Budget',
    'OOS',
    'Old Lead',
    'Not Interested'
  ]);

  private readonly pendingStatuses = new Set([
    'Follow-up',
    'Re-Enquire',
    'Expected Site Visit',
    'Expected Office Visit',
    'Not Answered'
  ]);

  constructor(
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
    private leadsService: LeadsService
  ) {}

  ngOnInit(): void {
    this.empId = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      userResponse: this.registrationService.getUserById(this.empId),
      leads: this.leadsService.getAll()
    }).subscribe({
      next: ({ userResponse, leads }) => {
        this.user = userResponse?.data;
        const allLeads = Array.isArray(leads) ? leads : [];
        this.assignedLeads = this.user ? allLeads.filter((lead) => this.isLeadOwnedByUser(lead, this.user)) : [];
        this.buildLeadSummary();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get fullName(): string {
    if (!this.user) {
      return '';
    }

    return [
      this.user.emp_first_name,
      this.user.emp_middle_name,
      this.user.emp_last_name
    ]
      .filter((name: string) => !!name && name.trim() !== '')
      .join(' ');
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .filter((part) => !!part)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  get roleLabel(): string {
    return this.formatRoleLabel(this.user?.role_id);
  }

  get userMetaItems(): string[] {
    if (!this.user) {
      return [];
    }

    return [
      this.user.email,
      this.user.phone_num,
      this.roleLabel
    ].filter((item: string) => !!item);
  }

  get leadAgeReference(): string {
    if (!this.user?.created_on) {
      return '-';
    }

    const createdDate = new Date(this.user.created_on);
    if (Number.isNaN(createdDate.getTime())) {
      return '-';
    }

    const diffMs = Date.now() - createdDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return `${diffDays} days`;
  }

  isActiveLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return !!status && !this.terminalStatuses.has(status);
  }

  isPendingLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return this.pendingStatuses.has(status);
  }

  isClosedLead(lead: Lead): boolean {
    return (lead.status || '').trim() === 'Deal Closed';
  }

  isLostLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return !!status && this.terminalStatuses.has(status) && status !== 'Deal Closed';
  }

  getStatusClass(status?: string): string {
    const normalizedStatus = (status || '').trim();

    if (normalizedStatus === 'Deal Closed') {
      return 'status-closed';
    }

    if (this.pendingStatuses.has(normalizedStatus)) {
      return 'status-pending';
    }

    if (this.terminalStatuses.has(normalizedStatus)) {
      return 'status-lost';
    }

    return 'status-active';
  }

  private buildLeadSummary(): void {
    this.leadSummary = {
      total: this.assignedLeads.length,
      active: this.assignedLeads.filter((lead) => this.isActiveLead(lead)).length,
      pending: this.assignedLeads.filter((lead) => this.isPendingLead(lead)).length,
      closed: this.assignedLeads.filter((lead) => this.isClosedLead(lead)).length,
      lost: this.assignedLeads.filter((lead) => this.isLostLead(lead)).length
    };
  }

  private isLeadOwnedByUser(lead: Lead, user: any): boolean {
    const leadValues = [
      lead.assignedToId,
      lead.currentAssignedTo,
      lead.assignedTo
    ]
      .filter((value): value is string => !!value)
      .map((value) => value.trim().toLowerCase());

    const userValues = [
      user.emp_id,
      this.fullName
    ]
      .filter((value: string) => !!value)
      .map((value: string) => value.trim().toLowerCase());

    return leadValues.some((value) => userValues.includes(value));
  }

  private formatRoleLabel(role?: string): string {
    if (!role) {
      return 'Unknown';
    }

    return role
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
