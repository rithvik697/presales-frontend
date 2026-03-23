import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Lead } from '../models/lead.model';
import { CallLogsService } from '../services/call-logs.service';
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
  isClickable?: boolean;
}

interface AdminLeadSummaryCard {
  label: string;
  value: number;
  isClickable?: boolean;
}

interface AdminStatusChartLegendItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface AdminLeadRow {
  userName: string;
  roleLabel: string;
  totalLeads: number;
  activeLeads: number;
  pendingLeads: number;
  siteVisitsDone: number;
  callsMade: number;
  dealsClosed: number;
}

type AdminLeadPeriod = 'today' | 'weekly' | 'monthly' | 'annually' | 'total';

interface AdminLeadPeriodOption {
  label: string;
  value: AdminLeadPeriod;
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
  public adminStatusChartData: any = null;
  public adminStatusChartOptions: any = {};
  public adminStatusLegendItems: AdminStatusChartLegendItem[] = [];
  public adminLeadPeriod: AdminLeadPeriod = 'total';
  public readonly adminLeadPeriodOptions: AdminLeadPeriodOption[] = [
    { label: 'Today', value: 'today' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Annually', value: 'annually' },
    { label: 'Total', value: 'total' }
  ];
  public showCallsMadePanel: boolean = false;
  public showSiteVisitsDonePanel: boolean = false;
  public siteVisitsDoneWeekly: number = 0;
  public siteVisitsDoneMonthly: number = 0;
  public totalSiteVisitsDone: number = 0;

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
    private callLogsService: CallLogsService,
    private leadsService: LeadsService,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'User';
    this.role = localStorage.getItem('role') || '';
    this.greeting = this.getGreeting();
    this.initializeAdminStatusChartOptions();
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
      leads: this.leadsService.getAll(),
      callLogs: this.callLogsService.getRawCallLogs(),
      statuses: this.leadsService.getStatuses()
    }).subscribe({
      next: ({ users, leads, callLogs, statuses }) => {
        const normalizedUsers = Array.isArray((users as any)?.data) ? (users as any).data : [];
        const normalizedLeads = Array.isArray(leads) ? leads : [];
        const normalizedCallLogs = Array.isArray(callLogs) ? callLogs : [];
        const normalizedStatuses = Array.isArray(statuses) ? statuses : [];

        this.adminUsers = normalizedUsers;
        this.buildAdminOverview(normalizedUsers, normalizedLeads);
        this.buildAdminLeadInsights(normalizedUsers, normalizedLeads, normalizedCallLogs);
        this.buildAdminStatusChart(normalizedStatuses, normalizedLeads);
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
        this.closedDeals = normalizedLeads.filter((lead) => (lead.status || '').trim() === 'Deal Closed').length;
        this.totalSiteVisitsDone = normalizedLeads.filter((lead) => this.isSiteVisitDoneLead(lead)).length;
        this.siteVisitsDoneWeekly = normalizedLeads.filter((lead) => this.isSiteVisitDoneLead(lead) && this.isInCurrentWeek(lead.modifiedAt)).length;
        this.siteVisitsDoneMonthly = normalizedLeads.filter((lead) => this.isSiteVisitDoneLead(lead) && this.isInCurrentMonth(lead.modifiedAt)).length;

        this.salesExecOverviewCards = [
          { label: 'TOTAL LEADS', value: this.totalLeads, type: 'all' },
          { label: 'ACTIVE LEADS', value: this.activeLeads, type: 'active' },
          { label: 'PENDING LEADS', value: this.pendingLeads, type: 'pending' },
          { label: 'DEALS CLOSED', value: this.closedDeals, type: 'status', statusName: 'Deal Closed' }
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
    if (!this.hasAdminStyleDashboard() || card.isClickable === false) {
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

  private isSiteVisitDoneLead(lead: Lead): boolean {
    return (lead.status || '').trim() === 'Site Visit Done';
  }

  private isInCurrentWeek(dateValue: string | undefined): boolean {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
  }

  private isInCurrentMonth(dateValue: string | undefined): boolean {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    );
  }

  onAdminLeadPeriodChange(): void {
    if (!this.hasAdminStyleDashboard()) {
      return;
    }

    this.loadAdminDashboard();
  }

  private buildAdminOverview(users: DashboardUser[], leads: Lead[]): void {
    const salesExecUsers = users.filter((user) => user.role_id === 'SALES_EXEC').length;
    const activeSalesExecUsers = users.filter(
      (user) => user.role_id === 'SALES_EXEC' && user.emp_status === 'Active'
    ).length;

    this.adminOverviewCards = [
      { label: 'TOTAL END USERS', value: salesExecUsers, queryParams: { role: 'SALES_EXEC' } },
      {
        label: 'ACTIVE END USERS',
        value: activeSalesExecUsers,
        queryParams: { role: 'SALES_EXEC', status: 'Active' }
      }
    ];
  }

  private isSameDay(dateValue: string | undefined, referenceDate: Date): boolean {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date.getFullYear() === referenceDate.getFullYear() &&
      date.getMonth() === referenceDate.getMonth() &&
      date.getDate() === referenceDate.getDate()
    );
  }

  private buildAdminLeadInsights(users: DashboardUser[], leads: Lead[], callLogs: any[]): void {
    const today = new Date();
    const leadsCreatedToday = leads.filter((lead) => this.isSameDay(lead.createdAt, today)).length;
    const expectedSiteVisitToday = leads.filter(
      (lead) => (lead.status || '').trim() === 'Expected Site Visit' && this.isSameDay(lead.modifiedAt, today)
    ).length;
    const siteVisitDoneToday = leads.filter(
      (lead) => (lead.status || '').trim() === 'Site Visit Done' && this.isSameDay(lead.modifiedAt, today)
    ).length;

    const leadOwners = users.filter((user) => ['SALES_EXEC', 'SALES_MGR', 'ADMIN'].includes(user.role_id));
    const rows = leadOwners.map((user) => {
      const ownedLeads = leads.filter((lead) => this.isLeadOwnedByUser(lead, user));
      const filteredOwnedLeads = ownedLeads.filter((lead) =>
        this.matchesAdminLeadPeriod(lead.modifiedAt || lead.createdAt)
      );
      const totalLeads = filteredOwnedLeads.length;
      const pendingLeads = filteredOwnedLeads.filter((lead) => this.isPendingLead(lead)).length;
      const activeLeads = filteredOwnedLeads.filter((lead) => this.isActiveLead(lead)).length;
      const siteVisitsDone = filteredOwnedLeads.filter((lead) => this.isSiteVisitDoneLead(lead)).length;
      const dealsClosed = filteredOwnedLeads.filter(
        (lead) => (lead.status || '').trim() === 'Deal Closed'
      ).length;
      const callsMade = callLogs.filter(
        (callLog) => this.isCallOwnedByUser(callLog, user) && this.matchesAdminLeadPeriod(callLog.call_time || callLog.callTime)
      ).length;

      return {
        userName: this.getUserFullName(user),
        roleLabel: this.formatRoleLabel(user.role_id),
        totalLeads,
        activeLeads,
        pendingLeads,
        siteVisitsDone,
        callsMade,
        dealsClosed
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
      { label: 'DEALS CLOSED', value: leads.filter((lead) => this.hasAssignedOwner(lead) && (lead.status || '').trim() === 'Deal Closed').length },
      { label: 'LEADS CREATED TODAY', value: leadsCreatedToday, isClickable: false },
      { label: "TODAY'S EXPECTED SITE VISIT", value: expectedSiteVisitToday, isClickable: false },
      { label: "TODAY'S SITE VISIT DONE", value: siteVisitDoneToday, isClickable: false }
    ];
  }

  private buildAdminStatusChart(statuses: any[], leads: Lead[]): void {
    const filteredLeads = leads.filter((lead) => this.matchesAdminLeadPeriod(lead.modifiedAt || lead.createdAt));
    const totalStatusLeads = filteredLeads.length;
    const statusNames = statuses.map((status) => (status?.status_name || '').trim()).filter((statusName) => !!statusName);

    const statusLegendItems = statusNames.map((statusName, index) => {
      const count = filteredLeads.filter((lead) => (lead.status || '').trim() === statusName).length;
      const percentage = totalStatusLeads > 0 ? Number(((count / totalStatusLeads) * 100).toFixed(1)) : 0;

      return {
        label: statusName,
        count,
        percentage,
        color: this.getStatusChartColor(index, statusNames.length)
      };
    }).filter((item) => item.count > 0);

    this.adminStatusLegendItems = statusLegendItems;
    this.adminStatusChartData = {
      labels: statusLegendItems.map((item) => item.label),
      datasets: [
        {
          data: statusLegendItems.map((item) => item.count),
          backgroundColor: statusLegendItems.map((item) => item.color),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8
        }
      ]
    };
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

  private matchesAdminLeadPeriod(dateValue: string | undefined): boolean {
    if (this.adminLeadPeriod === 'total') {
      return true;
    }

    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    if (this.adminLeadPeriod === 'today') {
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      return date >= startOfToday && date < endOfToday;
    }

    if (this.adminLeadPeriod === 'weekly') {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return date >= startOfWeek && date < endOfWeek;
    }

    if (this.adminLeadPeriod === 'monthly') {
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );
    }

    return date.getFullYear() === today.getFullYear();
  }

  private isCallOwnedByUser(callLog: any, user: DashboardUser): boolean {
    const callOwner = (callLog?.emp_id || '').toString().trim().toLowerCase();
    const userId = (user.emp_id || '').trim().toLowerCase();

    return !!callOwner && !!userId && callOwner === userId;
  }

  private initializeAdminStatusChartOptions(): void {
    this.adminStatusChartOptions = {
      cutout: '58%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const total = Array.isArray(context?.dataset?.data)
                ? context.dataset.data.reduce((sum: number, value: number) => sum + value, 0)
                : 0;
              const currentValue = Number(context?.raw || 0);
              const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : '0.0';

              return `${context.label}: ${percentage}% (${currentValue})`;
            }
          }
        }
      }
    };
  }

  private getStatusChartColor(index: number, totalItems: number): string {
    const hue = Math.round((360 / Math.max(totalItems, 1)) * index);
    return `hsl(${hue}, 70%, 55%)`;
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
