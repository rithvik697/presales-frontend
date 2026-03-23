import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Lead } from '../models/lead.model';
import { LeadsService } from '../services/leads.service';
import { RegistrationService } from '../services/registration.service';
import { ReportsService } from '../services/reports.service';

interface DashboardCard {
  label: string;
  value: number;
  type: 'all' | 'active' | 'pending' | 'status';
  statusName?: string;
}

interface DashboardUser {
  emp_id: string;
  role_id: string;
  emp_status: string;
  emp_first_name?: string;
  emp_middle_name?: string;
  emp_last_name?: string;
  created_on?: string;
}

interface AdminOverviewCard {
  label: string;
  value: number;
  queryParams?: Record<string, string>;
}

interface AdminLeadSummaryCard {
  label: string;
  value: number;
}

interface AdminLeadRow {
  userName: string;
  roleLabel: string;
  totalLeads: number;
  activeLeads: number;
  pendingLeads: number;
  closedLeads: number;
  lostLeads: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  fullName: string = '';
  greeting: string = '';
  role: string = '';

  totalLeads: number = 0;
  activeLeads: number = 0;
  pendingLeads: number = 0;
  closedDeals: number = 0;
  todayLeads: number = 0;
  lostLeads: number = 0;

  public salesExecOverviewCards: DashboardCard[] = [];
  public salesExecStatusCards: DashboardCard[] = [];
  public adminOverviewCards: AdminOverviewCard[] = [];
  public adminLeadSummaryCards: AdminLeadSummaryCard[] = [];
  public adminLeadRows: AdminLeadRow[] = [];
  public adminUsers: DashboardUser[] = [];

  loading: boolean = true;

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
    private reportsService: ReportsService,
    private leadsService: LeadsService,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'User';
    this.role = localStorage.getItem('role') || '';
    this.greeting = this.getGreeting();
    this.loadDashboard();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  isSalesExec(): boolean {
    return this.role === 'SALES_EXEC';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isSalesManager(): boolean {
    return this.role === 'SALES_MGR';
  }

  hasAdminStyleDashboard(): boolean {
    return this.isAdmin() || this.isSalesManager();
  }

  loadDashboard(): void {
    if (this.hasAdminStyleDashboard()) {
      this.loadAdminDashboard();
      return;
    }

    if (this.isSalesExec()) {
      this.loadSalesExecDashboard();
      return;
    }

    this.loadSummary();
  }

  loadSummary(): void {
    this.reportsService.getSummary().subscribe({
      next: (res: any) => {
        if (res?.success && res.data) {
          this.totalLeads = res.data.total_leads || 0;
          this.activeLeads = res.data.active_leads || 0;
          this.closedDeals = res.data.closed_leads || 0;
          this.todayLeads = res.data.today_leads || 0;
          this.lostLeads = res.data.lost_leads || 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAdminDashboard(): void {
    forkJoin({
      users: this.registrationService.getUsers(),
      leads: this.leadsService.getAll()
    }).subscribe({
      next: ({ users, leads }) => {
        const normalizedUsers = Array.isArray(users?.data) ? users.data : [];
        const normalizedLeads = Array.isArray(leads) ? leads : [];

        this.adminUsers = normalizedUsers;
        this.buildAdminOverview(normalizedUsers);
        this.buildAdminLeadInsights(normalizedUsers, normalizedLeads);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadSalesExecDashboard(): void {
    forkJoin({
      leads: this.leadsService.getAll(),
      statuses: this.leadsService.getStatuses()
    }).subscribe({
      next: ({ leads, statuses }) => {
        const normalizedLeads = Array.isArray(leads) ? leads : [];
        const normalizedStatuses = Array.isArray(statuses) ? statuses : [];

        this.totalLeads = normalizedLeads.length;
        this.activeLeads = normalizedLeads.filter((lead) => this.isActiveLead(lead)).length;
        this.pendingLeads = normalizedLeads.filter((lead) => this.isPendingLead(lead)).length;

        this.salesExecOverviewCards = [
          { label: 'TOTAL LEADS', value: this.totalLeads, type: 'all' },
          { label: 'ACTIVE LEADS', value: this.activeLeads, type: 'active' },
          { label: 'PENDING LEADS', value: this.pendingLeads, type: 'pending' }
        ];

        this.salesExecStatusCards = normalizedStatuses
          .map((status: any) => ({
            label: status.status_name,
            value: normalizedLeads.filter((lead) => lead.status === status.status_name).length,
            type: 'status' as const,
            statusName: status.status_name
          }))
          .filter((card) => card.value > 0);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openAdminUsers(card: AdminOverviewCard): void {
    if (!this.hasAdminStyleDashboard()) {
      return;
    }

    this.router.navigate(['/users'], { queryParams: card.queryParams || {} });
  }

  openLeadView(card: DashboardCard): void {
    if (!this.isSalesExec()) {
      return;
    }

    const queryParams: Record<string, string> = {};

    if (card.type === 'status' && card.statusName) {
      queryParams['status'] = card.statusName;
    } else if (card.type !== 'all') {
      queryParams['dashboardFilter'] = card.type;
    }

    this.router.navigate(['/leads'], { queryParams });
  }

  private isActiveLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return !!status && !this.terminalStatuses.has(status);
  }

  private isPendingLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return this.pendingStatuses.has(status);
  }

  private buildAdminOverview(users: DashboardUser[]): void {
    const activeUsers = users.filter((user) => user.emp_status === 'Active').length;
    const salesExecUsers = users.filter((user) => user.role_id === 'SALES_EXEC').length;
    const salesMgrUsers = users.filter((user) => user.role_id === 'SALES_MGR').length;
    const adminUsers = users.filter((user) => user.role_id === 'ADMIN').length;

    this.adminOverviewCards = [
      { label: 'TOTAL USERS', value: users.length, queryParams: {} },
      { label: 'ACTIVE USERS', value: activeUsers, queryParams: { status: 'Active' } },
      { label: 'SALES EXECS', value: salesExecUsers, queryParams: { role: 'SALES_EXEC' } },
      { label: 'SALES MANAGERS', value: salesMgrUsers, queryParams: { role: 'SALES_MGR' } },
      { label: 'ADMINS', value: adminUsers, queryParams: { role: 'ADMIN' } }
    ];
  }

  private buildAdminLeadInsights(users: DashboardUser[], leads: Lead[]): void {
    const leadOwners = users.filter((user) => ['SALES_EXEC', 'SALES_MGR', 'ADMIN'].includes(user.role_id));
    const rows = leadOwners.map((user) => {
      const ownedLeads = leads.filter((lead) => this.isLeadOwnedByUser(lead, user));
      const pendingLeads = ownedLeads.filter((lead) => this.isPendingLead(lead)).length;
      const activeLeads = ownedLeads.filter((lead) => this.isActiveLead(lead)).length;
      const closedLeads = ownedLeads.filter((lead) => (lead.status || '').trim() === 'Deal Closed').length;
      const lostLeads = ownedLeads.filter((lead) => this.isLostLead(lead)).length;

      return {
        userName: this.getUserFullName(user),
        roleLabel: this.formatRoleLabel(user.role_id),
        totalLeads: ownedLeads.length,
        activeLeads,
        pendingLeads,
        closedLeads,
        lostLeads
      };
    });

    this.adminLeadRows = rows.sort((a, b) => {
      if (b.totalLeads !== a.totalLeads) {
        return b.totalLeads - a.totalLeads;
      }

      return a.userName.localeCompare(b.userName);
    });

    this.adminLeadSummaryCards = [
      { label: 'TOTAL ASSIGNED LEADS', value: leads.filter((lead) => this.hasAssignedOwner(lead)).length },
      { label: 'ACTIVE PIPELINE', value: leads.filter((lead) => this.hasAssignedOwner(lead) && this.isActiveLead(lead)).length },
      { label: 'PENDING FOLLOW-UPS', value: leads.filter((lead) => this.hasAssignedOwner(lead) && this.isPendingLead(lead)).length },
      { label: 'DEALS CLOSED', value: leads.filter((lead) => this.hasAssignedOwner(lead) && (lead.status || '').trim() === 'Deal Closed').length }
    ];
  }

  private hasAssignedOwner(lead: Lead): boolean {
    return !!(lead.assignedToId || lead.currentAssignedTo || lead.assignedTo);
  }

  private isLeadOwnedByUser(lead: Lead, user: DashboardUser): boolean {
    const comparableValues = [
      lead.assignedToId,
      lead.currentAssignedTo,
      lead.assignedTo
    ]
      .filter((value): value is string => !!value)
      .map((value) => value.trim().toLowerCase());

    const userValues = [
      user.emp_id,
      this.getUserFullName(user)
    ]
      .filter((value): value is string => !!value)
      .map((value) => value.trim().toLowerCase());

    return comparableValues.some((leadValue) => userValues.includes(leadValue));
  }

  private isLostLead(lead: Lead): boolean {
    const status = (lead.status || '').trim();
    return !!status && this.terminalStatuses.has(status) && status !== 'Deal Closed';
  }

  private getUserFullName(user: DashboardUser): string {
    const fullName = [
      user.emp_first_name,
      user.emp_middle_name,
      user.emp_last_name
    ]
      .filter((name) => !!name && name.trim() !== '')
      .join(' ');

    return fullName || user.emp_id;
  }

  private formatRoleLabel(role: string): string {
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
