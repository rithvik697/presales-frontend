import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
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
  created_on?: string;
}

interface AdminOverviewCard {
  label: string;
  value: number;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('adminTrendChartCanvas') adminTrendChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('adminRoleChartCanvas') adminRoleChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('adminStatusChartCanvas') adminStatusChartCanvas?: ElementRef<HTMLCanvasElement>;

  fullName: string = '';
  greeting: string = '';
  role: string = '';

  totalLeads: number = 0;
  activeLeads: number = 0;
  pendingLeads: number = 0;
  closedDeals: number = 0;
  todayLeads: number = 0;
  lostLeads: number = 0;

  salesExecOverviewCards: DashboardCard[] = [];
  salesExecStatusCards: DashboardCard[] = [];
  adminOverviewCards: AdminOverviewCard[] = [];
  adminUsers: DashboardUser[] = [];
  adminTrendFilter: 'weekly' | 'monthly' | 'annual' = 'weekly';

  loading: boolean = true;
  private adminTrendChart: Chart | null = null;
  private adminRoleChart: Chart | null = null;
  private adminStatusChart: Chart | null = null;

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

  ngAfterViewInit(): void {
    this.renderAdminCharts();
  }

  ngOnDestroy(): void {
    this.destroyAdminCharts();
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

  loadDashboard(): void {
    if (this.isAdmin()) {
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
    this.registrationService.getUsers().subscribe({
      next: (res: any) => {
        const users = Array.isArray(res?.data) ? res.data : [];
        this.adminUsers = users;
        this.buildAdminOverview(users);
        this.loading = false;
        setTimeout(() => this.renderAdminCharts(), 0);
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

        this.salesExecStatusCards = normalizedStatuses.map((status: any) => ({
          label: status.status_name,
          value: normalizedLeads.filter((lead) => lead.status === status.status_name).length,
          type: 'status',
          statusName: status.status_name
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setAdminTrendFilter(filter: 'weekly' | 'monthly' | 'annual'): void {
    this.adminTrendFilter = filter;
    this.renderAdminTrendChart();
  }

  openAdminUsers(card: AdminOverviewCard): void {
    if (!this.isAdmin()) {
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
    const inactiveUsers = users.filter((user) => user.emp_status === 'Inactive').length;
    const salesExecUsers = users.filter((user) => user.role_id === 'SALES_EXEC').length;
    const salesMgrUsers = users.filter((user) => user.role_id === 'SALES_MGR').length;
    const adminUsers = users.filter((user) => user.role_id === 'ADMIN').length;

    this.adminOverviewCards = [
      { label: 'TOTAL USERS', value: users.length, queryParams: {} },
      { label: 'ACTIVE USERS', value: activeUsers, queryParams: { status: 'Active' } },
      { label: 'INACTIVE USERS', value: inactiveUsers, queryParams: { status: 'Inactive' } },
      { label: 'SALES EXECS', value: salesExecUsers, queryParams: { role: 'SALES_EXEC' } },
      { label: 'SALES MANAGERS', value: salesMgrUsers, queryParams: { role: 'SALES_MGR' } },
      { label: 'ADMINS', value: adminUsers, queryParams: { role: 'ADMIN' } }
    ];
  }

  private renderAdminCharts(): void {
    if (!this.isAdmin() || this.loading || !this.adminUsers.length) {
      return;
    }

    this.renderAdminTrendChart();
    this.renderAdminRoleChart();
    this.renderAdminStatusChart();
  }

  private renderAdminTrendChart(): void {
    if (!this.adminTrendChartCanvas) {
      return;
    }

    const grouped = this.groupUsersByCreatedDate(this.adminTrendFilter);
    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
    const datasetLabel =
      this.adminTrendFilter === 'weekly'
        ? 'Users Added (Last 7 Days)'
        : this.adminTrendFilter === 'monthly'
          ? 'Users Added (Last 30 Days)'
          : 'Users Added (This Year)';

    this.adminTrendChart?.destroy();
    this.adminTrendChart = new Chart(this.adminTrendChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data: values,
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  private renderAdminRoleChart(): void {
    if (!this.adminRoleChartCanvas) {
      return;
    }

    const groupedRoles = this.groupCount(this.adminUsers, (user) => this.formatRoleLabel(user.role_id));

    this.adminRoleChart?.destroy();
    this.adminRoleChart = new Chart(this.adminRoleChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: Object.keys(groupedRoles),
        datasets: [
          {
            data: Object.values(groupedRoles),
            backgroundColor: ['#1d4ed8', '#0f766e', '#f97316', '#7c3aed']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  private renderAdminStatusChart(): void {
    if (!this.adminStatusChartCanvas) {
      return;
    }

    const groupedStatus = this.groupCount(this.adminUsers, (user) => user.emp_status || 'Unknown');

    this.adminStatusChart?.destroy();
    this.adminStatusChart = new Chart(this.adminStatusChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(groupedStatus),
        datasets: [
          {
            data: Object.values(groupedStatus),
            backgroundColor: ['#84cc16', '#9ca3af', '#ef4444']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  private groupUsersByCreatedDate(filter: 'weekly' | 'monthly' | 'annual'): Record<string, number> {
    const grouped: Record<string, number> = {};
    const now = new Date();

    this.adminUsers.forEach((user) => {
      if (!user.created_on) {
        return;
      }

      const createdAt = new Date(user.created_on);
      if (Number.isNaN(createdAt.getTime())) {
        return;
      }

      let include = true;
      let key = '';

      if (filter === 'weekly') {
        const start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        include = createdAt >= start;
        key = createdAt.toISOString().split('T')[0];
      } else if (filter === 'monthly') {
        const start = new Date(now);
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        include = createdAt >= start;
        key = createdAt.toISOString().split('T')[0];
      } else {
        include = createdAt.getFullYear() === now.getFullYear();
        key = createdAt.toLocaleString('en-US', { month: 'short' });
      }

      if (!include) {
        return;
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    if (filter === 'annual') {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return Object.fromEntries(
        Object.entries(grouped).sort(
          ([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
        )
      );
    }

    return Object.fromEntries(
      Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    );
  }

  private groupCount<T>(items: T[], getKey: (item: T) => string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = getKey(item) || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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

  private destroyAdminCharts(): void {
    this.adminTrendChart?.destroy();
    this.adminRoleChart?.destroy();
    this.adminStatusChart?.destroy();
  }
}
