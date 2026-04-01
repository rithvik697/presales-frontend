import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ReportsService } from '../services/reports.service';
import { LeadsService } from '../services/leads.service';
import { ProjectService } from '../services/project-registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;

  summary: any = {
    total_leads: 0,
    active_leads: 0,
    closed_leads: 0,
    lost_leads: 0,
    today_leads: 0
  };

  currentFilter: 'weekly' | 'monthly' | 'annual' | 'daily' | 'total' = 'weekly';
  lineChart: any;
  pieChart: any;
  loadingSummary: boolean = false;
  loadingLineChart: boolean = false;
  loadingPieChart: boolean = false;

  startDate: string = '';
  endDate: string = '';
  selectedProject: string = '';
  selectedUser: string = '';
  selectedSource: string = '';
  selectedStatus: string = '';

  // User Performance Specific Filters
  perfStartDate: string = '';
  perfEndDate: string = '';
  perfSelectedProject: string = '';
  perfSelectedUser: string = '';
  perfSelectedSource: string = '';
  perfSelectedStatus: string = '';

  usersList: any[] = [];
  projectsList: any[] = [];
  sourcesList: any[] = [];
  statusesList: any[] = [];

  dailyLog: any[] = [];
  weeklyLog: any[] = [];
  userPerformance: any[] = [];
  selectedPerfStatuses: string[] = []; // Array for multi-select
  perfDynamicStatuses: any[] = []; // Statuses with counts for dropdown
  monthlyLog: any[] = [];

  downloadMenuItems: any[] = [];
  perfDownloadMenuItems: any[] = [];
  dailyDownloadMenuItems: any[] = [];
  weeklyDownloadMenuItems: any[] = [];
  monthlyDownloadMenuItems: any[] = [];

  // Dialog State
  displaySummaryDialog: boolean = false;
  summaryDialogTitle: string = '';
  summaryDialogData: any[] = [];
  summaryDialogType: string = '';
  loadingSummaryData: boolean = false;

  // Monthly Performance Report State
  monthlyReportDialogVisible: boolean = false;
  monthlyReportData: any = null;
  monthlyReportIndividuals: any[] = [];
  loadingMonthlyReport: boolean = false;
  showIndividualPerf: boolean = false;

  // Weekly Performance Report State
  weeklyReportData: any = null;
  weeklyReportIndividuals: any[] = [];
  loadingWeeklyReport: boolean = false;
  showWeeklyPerf: boolean = false;

  // Annual Performance Report State
  annualReportData: any = null;
  annualReportIndividuals: any[] = [];
  loadingAnnualReport: boolean = false;
  showAnnualPerf: boolean = false;

  // Consolidated Performance State
  perfReportFilter: 'weekly' | 'monthly' | 'annual' = 'weekly';
  currentPerfIndividuals: any[] = [];
  currentPerfReportData: any = null;
  perfDownloadMenus: Map<string, any[]> = new Map();

  // Permanent / Immutable History Report State
  activePermanentRecordData: any[] = [];
  loadingPermanentRecord = false;
  permanentRecordLoaded = false;
  selectedPermanentRecordType: 'site_visit' | 'deal_closed' = 'site_visit';
  permStartDate: string = '';
  permEndDate: string = '';
  permanentRecordOptions = [
    { label: 'Site Visit Done', value: 'site_visit' },
    { label: 'Deal Closed', value: 'deal_closed' }
  ];
  permanentRecordDownloadMenuItems: any[] = [];

  constructor(
      private reportsService: ReportsService,
      private leadsService: LeadsService,
      private projectService: ProjectService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.downloadMenuItems = [
      { label: 'Export as CSV', icon: 'pi pi-file-excel', command: () => this.downloadActiveLeads() },
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadActiveLeadsPdf() }
    ];

    this.perfDownloadMenuItems = [
      { label: 'Export as CSV', icon: 'pi pi-file-excel', command: () => this.downloadUserPerformanceCsv() },
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadUserPerformancePdf() }
    ];

    this.dailyDownloadMenuItems = [
      { label: 'Export as CSV', icon: 'pi pi-file-excel', command: () => this.downloadDailyLogCsv() },
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadDailyLogPdf() }
    ];

    this.weeklyDownloadMenuItems = [
      { label: 'Export as CSV', icon: 'pi pi-file-excel', command: () => this.downloadWeeklyLogCsv() },
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadWeeklyLogPdf() }
    ];

    this.monthlyDownloadMenuItems = [
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadMonthlyReportPdf() }
    ];

    this.permanentRecordDownloadMenuItems = [
      { label: 'Export as CSV', icon: 'pi pi-file-excel', command: () => this.downloadPermanentRecord('csv') },
      { label: 'Export as PDF', icon: 'pi pi-file-pdf', command: () => this.downloadPermanentRecord('pdf') }
    ];

    this.route.queryParams.subscribe(params => {
      // Synchronize filters with URL parameters; clear if not present
      this.selectedUser = params['userId'] || '';
      this.selectedProject = params['projectId'] || '';
      this.selectedSource = params['sourceId'] || '';
      this.selectedStatus = params['statusId'] || '';
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';

      // Removed default Financial Year parsing from here so it loads empty

      this.loadDropdownData();
      this.applyFilters(true); // first load
      this.setPerfFilter('weekly');
    });
  }

  ngAfterViewInit(): void {
    // Canvas is now ready. 
    // chart calls are already made in applyFilters(true), 
    // but we might need to render them if data arrived before view init.
    // However, Chart.js needs the canvas to be ready.
    // So we just ensure applyFilters is called here if needed, 
    // but better to just let applyFilters handle it after a small delay if chart canvas not ready.
  }

  loadDropdownData() {
    // Restrict to SALES_EXEC as requested
    this.leadsService.getEmployees('SALES_EXEC').subscribe({
        next: (res: any) => {
            this.usersList = Array.isArray(res) ? res : res.data || [];
        },
        error: (err: any) => console.error(err)
    });

    this.projectService.getProjects().subscribe({
        next: (res: any[]) => {
             this.projectsList = Array.isArray(res) ? res : (res as any).data || [];
        },
        error: (err: any) => console.error(err)
    });

    this.leadsService.getSources().subscribe({
      next: (res: any) => {
        this.sourcesList = Array.isArray(res) ? res : res.data || [];
      },
      error: (err) => console.error(err)
    });

    this.leadsService.getStatuses().subscribe({
      next: (res: any) => {
        this.statusesList = Array.isArray(res) ? res : res.data || [];
      },
      error: (err) => console.error(err)
    });
  }

  loadSummary() {
    this.loadingSummary = true;
    this.reportsService.getSummary(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus).subscribe({
      next: (res) => {
        if(res.success) {
          this.summary = res.data;
        }
        this.loadingSummary = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingSummary = false;
      }
    });
  }

  // Logs data state
  dailyLogLoaded = false;
  weeklyLogLoaded = false;
  monthlyLogLoaded = false;

  // Returns the current Financial Year start and today as YYYY-MM-DD strings
  getFyDates(): { start: string; end: string } {
    const today = new Date();
    const fyStartYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${fyStartYear}-04-01`;
    const end = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    return { start, end };
  }

  applyFilters(isInitial: boolean = false) {
    this.loadSummary();
    this.loadLineChartData();
    this.loadPieChartData();

    // Eagerly load logs so they are always available when panels are expanded
    this.loadDailyLog();
    this.loadWeeklyLog();
    this.loadMonthlyLog();
    this.dailyLogLoaded = true;
    this.weeklyLogLoaded = true;
    this.monthlyLogLoaded = true;

    this.loadMonthlyReport();
    this.loadWeeklyPerformanceReport();
    this.loadAnnualPerformanceReport();
    this.loadUserPerformance();

    // Reload immutable history panels
    this.permanentRecordLoaded = false;
    this.activePermanentRecordData = [];
    // Eagerly load so it's ready when expanded
    this.loadPermanentRecord(true);
  }

  onPanelExpand(type: 'daily' | 'weekly' | 'monthly') {
    // Kept for compatibility if used but data should already be loaded
  }

  applyUserPerformanceFilters() {
    this.loadUserPerformance();
  }

  clearFilters() {
    this.selectedUser = '';
    this.selectedProject = '';
    this.selectedSource = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';

    // Clear route query params visually and functionally
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: ''
    });

    this.applyFilters();
  }

  clearPerfFilters() {
    this.perfSelectedUser = '';
    this.perfSelectedProject = '';
    this.perfSelectedSource = '';
    this.perfSelectedStatus = '';
    this.perfStartDate = '';
    this.perfEndDate = '';
    this.loadUserPerformance();
  }

  setFilter(filter: 'weekly' | 'monthly' | 'annual' | 'daily' | 'total') {
    this.currentFilter = filter;
    this.loadLineChartData();
  }

  setPerfFilter(filter: 'weekly' | 'monthly' | 'annual') {
    this.perfReportFilter = filter;
    this.updateCurrentPerfState();
    
    // Load data if not already loaded
    if (filter === 'weekly' && this.weeklyReportIndividuals.length === 0) this.loadWeeklyPerformanceReport();
    if (filter === 'monthly' && this.monthlyReportIndividuals.length === 0) this.loadMonthlyReport();
    if (filter === 'annual' && this.annualReportIndividuals.length === 0) this.loadAnnualPerformanceReport();
  }

  formatDate(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getSpecificDateRange(filter: 'weekly' | 'monthly' | 'annual'): string {
    const d = new Date();
    if (filter === 'weekly') {
      const day = d.getDay() || 7;  
      const start = new Date(d);
      start.setDate(d.getDate() - day + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    } else if (filter === 'monthly') {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    } else if (filter === 'annual') {
      const startYear = d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear();
      return `FY ${startYear}-${(startYear + 1).toString().slice(2)}`;
    }
    return '';
  }

  getTodayDate(): string {
    return this.formatDate(new Date());
  }

  getPerformanceDateRange(): string {
    return this.getSpecificDateRange(this.perfReportFilter);
  }

  updateCurrentPerfState() {
    if (this.perfReportFilter === 'weekly') {
      this.currentPerfIndividuals = this.weeklyReportIndividuals;
      this.currentPerfReportData = this.weeklyReportData;
    } else if (this.perfReportFilter === 'monthly') {
      this.currentPerfIndividuals = this.monthlyReportIndividuals;
      this.currentPerfReportData = this.monthlyReportData;
    } else if (this.perfReportFilter === 'annual') {
      this.currentPerfIndividuals = this.annualReportIndividuals;
      this.currentPerfReportData = this.annualReportData;
    }
    this.generatePerfDownloadMenus();
  }

  generatePerfDownloadMenus() {
    this.perfDownloadMenus.clear();
    const activities = ['All Leads', 'Site Visit Done', 'Office Visit Done', 'Pipeline', 'Deals Closed', 'Spam'];
    this.currentPerfIndividuals.forEach(indiv => {
      const menu = activities.map(act => ({
        label: act,
        items: [
          { label: 'Download CSV', icon: 'pi pi-file-excel', command: () => this.downloadUserLeads(indiv.emp_id || indiv.name, indiv.name, act, 'csv') },
          { label: 'Download PDF', icon: 'pi pi-file-pdf', command: () => this.downloadUserLeads(indiv.emp_id || indiv.name, indiv.name, act, 'pdf') }
        ]
      }));
      this.perfDownloadMenus.set(indiv.name, menu);
    });
  }

  loadLineChartData() {
    if (!this.lineChartCanvas) {
      setTimeout(() => this.loadLineChartData(), 500);
      return;
    }

    this.loadingLineChart = true;
    let obs;
    let label = '';
    let xKey = 'date';

    switch (this.currentFilter) {
      case 'daily':
        obs = this.reportsService.getDailyReport(this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus);
        label = "Leads Created (Today's Hourly)";
        xKey = 'hour';
        break;
      case 'weekly':
        obs = this.reportsService.getWeeklyReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus);
        label = 'Leads Created (Current Week)';
        xKey = 'date';
        break;
      case 'monthly':
        obs = this.reportsService.getMonthlyReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus);
        label = 'Leads Created (Current Month)';
        xKey = 'date';
        break;
      case 'annual':
        obs = this.reportsService.getAnnualReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus);
        label = 'Leads Created (Financial Year)';
        xKey = 'month';
        break;
      case 'total':
        obs = this.reportsService.getMonthlyReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus);
        label = 'Total Leads (Cumulative last 30 days)';
        xKey = 'date';
        break;
    }

    if (obs) {
      obs.subscribe({
        next: (res: any) => {
          this.loadingLineChart = false;
          if (res.success) {
            const labels = res.data.map((d: any) => d[xKey]);
            let data = res.data.map((d: any) => d.leads);

            if (this.currentFilter === 'total') {
              let sum = 0;
              data = data.map((v: number) => {
                sum += v;
                return sum;
              });
              this.renderLineChart(labels, data, label, 'line');
            } else {
              this.renderLineChart(labels, data, label, 'bar');
            }
          }
        },
        error: (err: any) => {
          console.error(err);
          this.loadingLineChart = false;
        }
      });
    }
  }

  loadMonthlyLog() {
    let m: number | undefined;
    let y: number | undefined;
    if (this.startDate) {
        const d = new Date(this.startDate);
        m = d.getMonth() + 1;
        y = d.getFullYear();
    }
    this.reportsService.getMonthlyLog(m, y, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus).subscribe({
        next: (res) => {
            if(res.success) {
                this.monthlyLog = res.data;
            }
        },
        error: (err) => console.error(err)
    });
  }

  loadPieChartData() {
    if (!this.pieChartCanvas) {
        setTimeout(() => this.loadPieChartData(), 500);
        return;
    }

    this.loadingPieChart = true;
    this.reportsService.getStatusDistribution(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus).subscribe({
      next: (res) => {
        this.loadingPieChart = false;
        if(res.success) {
          const labels = res.data.map((d: any) => d.status_name || 'Unknown');
          const data = res.data.map((d: any) => d.leads);
          this.renderPieChart(labels, data);
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingPieChart = false;
      }
    });
  }

  loadUserPerformance() {
    // Use local perf filters if set, otherwise use global ones
    const sDate = this.perfStartDate || this.startDate;
    const eDate = this.perfEndDate || this.endDate;
    const pId = this.perfSelectedProject || this.selectedProject;
    const uId = this.perfSelectedUser || this.selectedUser;
    const srcId = this.perfSelectedSource || this.selectedSource;
    const statId = this.perfSelectedStatus || this.selectedStatus;

    this.reportsService.getUserPerformance(sDate, eDate, pId, uId, srcId, statId).subscribe({
      next: (res) => {
         if(res.success) {
            const rawData = res.data.filter((u: any) => u.user_name !== 'Unassigned');
            
            // Fixed and Spam statuses definitions
            const fixedStatuses = ['Site Visit Done', 'Office Visit Done', 'Deal Closed', 'Pipeline'];
            const spamStatuses = ['Spam', 'Low Budget', 'OOS', 'Old Lead', 'Not Answered', 'Not Interested'];
            const excludedFromPipeline = [...fixedStatuses, ...spamStatuses];

            // 1. Map Data and set Pipeline count (Specific 'Pipeline' status only)
            this.userPerformance = rawData.map((u: any) => {
              const counts = u.status_counts || {};
              return {
                ...u,
                pipeline: counts['Pipeline'] || 0,
                downloadMenuItems: this.getDownloadMenu(u)
              };
            });

            // 2. Prepare Dynamic Status Dropdown list
            const globalStatusTotals: { [key: string]: number } = {};
            rawData.forEach((u: any) => {
              const counts = u.status_counts || {};
              Object.keys(counts).forEach(status => {
                globalStatusTotals[status] = (globalStatusTotals[status] || 0) + counts[status];
              });
            });

            // Filter out fixed statuses from the dynamic dropdown
            this.perfDynamicStatuses = this.statusesList
              .filter(s => !fixedStatuses.includes(s.status_name))
              .map(s => {
                const count = globalStatusTotals[s.status_name] || 0;
                return {
                  ...s,
                  displayName: `${s.status_name} (${count})`,
                  count: count
                };
              })
              .sort((a, b) => b.count - a.count); // Prioritize statuses with leads on top

            // Set default selected status if empty
            if (this.selectedPerfStatuses.length === 0 && this.perfDynamicStatuses.length > 0) {
               this.selectedPerfStatuses = [this.perfDynamicStatuses[0].status_name];
            } else {
               // Remove 'Pipeline' if it was previously selected in the dynamic list
               this.selectedPerfStatuses = this.selectedPerfStatuses.filter(s => s !== 'Pipeline');
            }
         }
      },
      error: (err) => console.error(err)
    });
  }

  loadDailyLog() {
      this.reportsService.getDailyLog(this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus).subscribe({
          next: (res) => {
              if(res.success) {
                  this.dailyLog = res.data;
              }
          },
          error: (err) => console.error(err)
      })
  }

  loadPermanentRecord(forceRefresh = false) {
    if (this.permanentRecordLoaded && !forceRefresh) return;
    this.loadingPermanentRecord = true;
    
    // Use local perm filters if set, otherwise fallback to global ones
    const sDate = this.permStartDate || this.startDate;
    const eDate = this.permEndDate || this.endDate;
    const pId = this.selectedProject || undefined;
    const uId = this.selectedUser || undefined;

    this.reportsService.getHistoryReport(this.selectedPermanentRecordType, sDate, eDate, pId, uId).subscribe({
      next: (res) => {
        if (res.success) this.activePermanentRecordData = res.data;
        this.loadingPermanentRecord = false;
        this.permanentRecordLoaded = true;
      },
      error: (err) => { console.error(err); this.loadingPermanentRecord = false; }
    });
  }

  onPermanentRecordTypeChange() {
    this.permanentRecordLoaded = false;
    this.loadPermanentRecord(true);
  }

  applyPermanentRecordFilters() {
    this.permanentRecordLoaded = false;
    this.loadPermanentRecord(true);
  }

  clearPermanentRecordFilters() {
    this.permStartDate = '';
    this.permEndDate = '';
    this.applyPermanentRecordFilters();
  }

  downloadPermanentRecord(format: 'csv' | 'pdf') {
    const data = this.activePermanentRecordData;
    const type = this.selectedPermanentRecordType;
    const label = type === 'site_visit' ? 'Site Visit Done' : 'Deal Closed';
    
    if (!data || data.length === 0) return;
    
    const headers = ['Lead ID', 'Lead Name', 'Employee', 'Project', `${label} On`, 'Current Activity Status', 'Remarks'];
    
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) => {
          const changedAt = row.changed_at ? new Date(row.changed_at).toLocaleDateString('en-GB') : '';
          return `"${row.lead_id}","${(row.lead_name || '').trim()}","${row.employee_name}","${row.project_name}","${changedAt}","${row.current_status || ''}","${(row.remarks || '').replace(/"/g, '""')}"`;
        })
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_permanent_record_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const doc = new jsPDF();
      doc.text(`${label} – Permanent Record`, 14, 15);
      const body = data.map((row: any) => [
        row.lead_id,
        (row.lead_name || '').trim(),
        row.employee_name,
        row.project_name,
        row.changed_at ? new Date(row.changed_at).toLocaleDateString('en-GB') : '',
        row.current_status || '',
      ]);
      autoTable(doc, {
        head: [['Lead ID', 'Lead Name', 'Employee', 'Project', `${label} On`, 'Current Activity Status']],
        body,
        startY: 20
      });
      doc.save(`${type}_permanent_record_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  }

  loadWeeklyLog() {
      this.reportsService.getWeeklyLog(this.startDate, this.endDate, this.selectedProject, this.selectedUser, this.selectedSource, this.selectedStatus).subscribe({
          next: (res: any) => {
              if (res.success) {
                  this.weeklyLog = res.data;
              }
          },
          error: (err: any) => console.error(err)
      });
  }

  renderLineChart(labels: string[], data: number[], datasetLabel: string, type: 'line' | 'bar' = 'bar') {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: data,
          backgroundColor: '#1976d2',
          borderColor: '#1976d2',
          borderWidth: 1
        }]
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

  renderPieChart(labels: string[], data: number[]) {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    const backgroundColors = [
      '#4caf50', // Converted/Active
      '#f44336', // Lost
      '#ff9800', // Contacted
      '#2196f3', // New
      '#9c27b0'
    ];
    this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors.slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  downloadActiveLeads() {
    this.reportsService.downloadActiveLeads().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'active_leads.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Failed to download report.');
      }
    });
  }

  downloadActiveLeadsPdf() {
    this.reportsService.getActiveLeadsJson().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const doc = new jsPDF();
          doc.text('Active Leads Report', 14, 15);
          autoTable(doc, {
            head: [res.columns],
            body: res.data,
            startY: 20
          });
          doc.save('active_leads.pdf');
        }
      },
      error: (err) => {
        console.error('Failed to download PDF', err);
        alert('Failed to download PDF report.');
      }
    });
  }

  downloadUserPerformanceCsv() {
    if (!this.userPerformance || this.userPerformance.length === 0) return;
    
    // Dynamic headers based on selection
    const dynamicHeaders = this.selectedPerfStatuses;
    const headers = ['EMP ID', 'User Name', 'Total Assigned', 'Site Visit', 'Office Visit', 'Pipeline', ...dynamicHeaders, 'Deals Closed'];
    
    const csvContent = [
      headers.join(','),
      ...this.userPerformance.map(row => {
        const counts = row.status_counts || {};
        const dynamicValues = dynamicHeaders.map(s => counts[s] || 0);
        return `"${row.emp_id || ''}","${row.user_name}","${row.total_assigned}","${counts['Site Visit Done'] || 0}","${counts['Office Visit Done'] || 0}","${row.pipeline}",${dynamicValues.map(v => `"${v}"`).join(',')},"${counts['Deal Closed'] || 0}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_performance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadUserPerformancePdf() {
    if (!this.userPerformance || this.userPerformance.length === 0) return;
    const doc = new jsPDF();
    doc.text('User Performance Report', 14, 15);
    
    const dynamicHeaders = this.selectedPerfStatuses;
    const body = this.userPerformance.map(row => {
      const counts = row.status_counts || {};
      const dynamicValues = dynamicHeaders.map(s => counts[s] || 0);
      return [
        row.emp_id || 'N/A', row.user_name, row.total_assigned, counts['Site Visit Done'] || 0, counts['Office Visit Done'] || 0, row.pipeline, ...dynamicValues, counts['Deal Closed'] || 0
      ];
    });
    autoTable(doc, {
      head: [['EMP ID', 'User Name', 'Total Assigned', 'Site Visit', 'Office Visit', 'Pipeline', ...dynamicHeaders, 'Deals Closed']],
      body: body,
      startY: 20
    });
    doc.save('user_performance.pdf');
  }

  downloadDailyLogCsv() {
    if (!this.dailyLog || this.dailyLog.length === 0) return;
    const headers = ['Lead ID', 'Lead Name', 'Created On', 'Assigned User', 'Project', 'Activity Status'];
    const csvContent = [
      headers.join(','),
      ...this.dailyLog.map(row => 
        `"${row.lead_id}","${row.lead_name || 'N/A'}","${row.created_on}","${row.employee_name}","${row.project_name}","${row.label || 'Unknown'}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadDailyLogPdf() {
    if (!this.dailyLog || this.dailyLog.length === 0) return;
    const doc = new jsPDF();
    const formattedDate = new Date().toLocaleDateString();
    doc.text(`Daily Report Log - ${formattedDate}`, 14, 15);
    
    // AutoTable creates the table
    const body = this.dailyLog.map(row => [
      row.lead_id, 
      row.lead_name || 'N/A', 
      row.created_on, 
      row.employee_name, 
      row.project_name, 
      row.label || 'Unknown'
    ]);

    autoTable(doc, {
      head: [['Lead ID', 'Lead Name', 'Created On', 'Assigned User', 'Project', 'Activity Status']],
      body: body,
      startY: 20
    });
    
    doc.save(`daily_log_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  downloadWeeklyLogCsv() {
    if (!this.weeklyLog || this.weeklyLog.length === 0) return;
    const headers = ['Time', 'Customer Name', 'Project Name', 'Source', 'Employee Name'];
    const csvContent = [
      headers.join(','),
      ...this.weeklyLog.map(row => 
        `"${row.created_on}","${row.customer_name}","${row.project_name}","${row.source_name}","${row.employee_name}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadWeeklyLogPdf() {
    if (!this.weeklyLog || this.weeklyLog.length === 0) return;
    const doc = new jsPDF();
    const formattedDate = new Date().toLocaleDateString();
    doc.text(`Weekly Report Log - ${formattedDate}`, 14, 15);
    
    const body = this.weeklyLog.map(row => [
      new Date(row.created_on).toLocaleString(), 
      row.customer_name, 
      row.project_name, 
      row.source_name, 
      row.employee_name
    ]);

    autoTable(doc, {
      head: [['Time', 'Customer Name', 'Project Name', 'Source', 'Employee Name']],
      body: body,
      startY: 20
    });
    
    doc.save(`weekly_log_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  getDownloadMenu(user: any) {
    const activities = ['All Leads', 'Site Visit Done', 'Office Visit Done', 'Pipeline', 'Deals Closed', 'Spam'];
    return activities.map(act => {
      return {
        label: act,
        items: [
           { label: 'Download CSV', icon: 'pi pi-file-excel', command: () => this.downloadUserLeads(user.emp_id, user.user_name, act, 'csv') },
           { label: 'Download PDF', icon: 'pi pi-file-pdf', command: () => this.downloadUserLeads(user.emp_id, user.user_name, act, 'pdf') }
        ]
      };
    });
  }

  downloadUserLeads(empId: string, userName: string, activity: string, format: 'csv' | 'pdf' = 'csv') {
    if (format === 'csv') {
      this.reportsService.downloadUserLeads(empId, userName, activity, this.startDate, this.endDate, this.selectedProject, this.selectedSource, this.selectedStatus).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `leads_${empId}_${activity.replace(/ /g, '_')}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Download failed', err);
          alert('Failed to download user leads CSV.');
        }
      });
    } else {
      this.reportsService.getUserLeadsJson(empId, userName, activity, this.startDate, this.endDate, this.selectedProject, this.selectedSource, this.selectedStatus).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const doc = new jsPDF();
            doc.text(`User Leads Report - ${activity}`, 14, 15);
            doc.setFontSize(10);
            doc.text(`EMP ID: ${empId || 'N/A'} | User Name: ${userName}`, 14, 22);
            
            const columns = ["Lead ID", "Lead Name", "Activity Status", "Description", "Project", "Created On", "Current Activity Status"];
            const body = res.data.map((row: any) => [
              row.lead_id,
              row.lead_name,
              activity,
              row.lead_description,
              row.project_name,
              row.created_on,
              row.status_name
            ]);
            autoTable(doc, {
              head: [columns],
              body: body,
              startY: 28
            });
            doc.save(`leads_${empId}_${activity.replace(/ /g, '_')}.pdf`);
          }
        },
        error: (err) => {
          console.error('Failed to download PDF', err);
          alert('Failed to download user leads PDF.');
        }
      });
    }
  }

  // --- Dialog Methods ---
  openSummaryDetails(type: string, title: string) {
    this.summaryDialogTitle = title;
    this.displaySummaryDialog = true;
    this.loadingSummaryData = true;
    this.summaryDialogData = [];
    this.summaryDialogType = type;
    
    // Check if we have specific filters applied
    const userId = this.selectedUser || undefined;
    const projId = this.selectedProject || undefined;

    this.reportsService.getSummaryLeads(type, this.startDate, this.endDate, projId, userId, this.selectedSource, this.selectedStatus).subscribe({
      next: (res: any) => {
         if (res.success && res.data) {
             this.summaryDialogData = res.data;
         } else {
             this.summaryDialogData = [];
         }
         this.loadingSummaryData = false;
      },
      error: (err: any) => {
         console.error('Error fetching summary details', err);
         this.loadingSummaryData = false;
         // silently fail - don't alert
      }
    });
  }

  // --- Monthly Performance Report Methods ---
  monthlyReportError: string = '';
  loadMonthlyReport() {
    this.loadingMonthlyReport = true;
    this.monthlyReportData = null;
    this.monthlyReportIndividuals = [];
    this.monthlyReportError = '';

    // Extract month and year from startDate if available, else omit (defaults to current month in backend)
    let m: number | undefined;
    let y: number | undefined;
    if (this.startDate) {
        const d = new Date(this.startDate);
        m = d.getMonth() + 1; // 1-12
        y = d.getFullYear();
    }

    this.reportsService.getMonthlyPerformanceReport(m, y, this.selectedProject || undefined).subscribe({
        next: (res: any) => {
            if (res.success && res.data) {
                this.monthlyReportData = res.data;
                const currIndiv = res.data.current.individuals;
                const prevIndiv = res.data.previous.individuals;
                
                this.monthlyReportIndividuals = Object.keys(currIndiv).map(empId => {
                    const ic = currIndiv[empId];
                    const ip = prevIndiv[empId] || { leads_received: 0, site_visits: 0, calls_attempted: 0, deals_closed: 0 };
                    return {
                        emp_id: empId,
                        name: ic.name,
                        curr: ic,
                        prev: ip
                    };
                });
                this.updateCurrentPerfState();
            } else {
                this.monthlyReportError = 'Error building report. Please try again.';
            }
            this.loadingMonthlyReport = false;
        },
        error: (err: any) => {
            console.error('Failed to get monthly performance report', err);
            this.monthlyReportError = 'Could not load monthly data. Please refresh.';
            this.loadingMonthlyReport = false;
        }
    });
  }

  loadWeeklyPerformanceReport() {
    this.loadingWeeklyReport = true;
    this.weeklyReportData = null;
    this.weeklyReportIndividuals = [];

    this.reportsService.getWeeklyPerformanceReport(this.selectedProject || undefined).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.weeklyReportData = res.data;
          const currIndiv = res.data.current.individuals;
          const prevIndiv = res.data.previous.individuals;
          this.weeklyReportIndividuals = Object.keys(currIndiv).map(empId => ({
            emp_id: empId,
            name: currIndiv[empId].name,
            curr: currIndiv[empId],
            prev: prevIndiv[empId] || { leads_received: 0, site_visits: 0, calls_attempted: 0, deals_closed: 0 }
          }));
          this.updateCurrentPerfState();
        }
        this.loadingWeeklyReport = false;
      },
      error: (err: any) => {
        console.error('Failed to get weekly performance report', err);
        this.loadingWeeklyReport = false;
      }
    });
  }

  loadAnnualPerformanceReport() {
    this.loadingAnnualReport = true;
    this.annualReportData = null;
    this.annualReportIndividuals = [];

    // Extract year from startDate if available
    let y: number | undefined;
    if (this.startDate) {
        const d = new Date(this.startDate);
        y = d.getFullYear();
    }

    this.reportsService.getAnnualPerformanceReport(y, this.selectedProject || undefined).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.annualReportData = res.data;
          const currIndiv = res.data.current.individuals;
          const prevIndiv = res.data.previous.individuals;
          this.annualReportIndividuals = Object.keys(currIndiv).map(empId => ({
            emp_id: empId,
            name: currIndiv[empId].name,
            curr: currIndiv[empId],
            prev: prevIndiv[empId] || { leads_received: 0, site_visits: 0, calls_attempted: 0, deals_closed: 0 }
          }));
          this.updateCurrentPerfState();
        }
        this.loadingAnnualReport = false;
      },
      error: (err: any) => {
        console.error('Failed to get annual performance report', err);
        this.loadingAnnualReport = false;
      }
    });
  }

  downloadMonthlyReportPdf() {
      if (!this.monthlyReportData) return;
      const doc = new jsPDF();
      const d = this.monthlyReportData;
      const c = d.current.overall;
      const p = d.previous.overall;
      const h = d.highlights;
      
      doc.setFontSize(14);
      doc.text(`${d.month_name} ${d.year} Monthly Performance Report`, 14, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(25, 118, 210); // Blue header
      doc.text('OVERALL STATISTICS', 14, 25);
      
      doc.setTextColor(0, 0, 0); // Reset to black
      const overallBody = [
          ['Leads Received', `${c.leads_received} (${d.prev_month_name}: ${p.leads_received})`],
          ['Test Leads', `${c.test_leads} (${d.prev_month_name}: ${p.test_leads})`],
          ['Site Visit Done', `${c.site_visits} (${d.prev_month_name}: ${p.site_visits})`],
          ['Not Enquired/Spam', `${c.spam} (${d.prev_month_name}: ${p.spam})`],
          ['Not Interested', `${c.not_interested} (${d.prev_month_name}: ${p.not_interested})`],
          ['Walk-ins (incl digital)', `${c.walkins} (${d.prev_month_name}: ${p.walkins})`],
          ['mcube (IVR)', `${c.mcube} (${d.prev_month_name}: ${p.mcube})`],
          ['Calls Attempted', `${c.calls_attempted} (${d.prev_month_name}: ${p.calls_attempted})`],
          ['DEAL CLOSED', `${c.deal_closed} (${d.prev_month_name}: ${p.deal_closed})`]
      ];
      
      autoTable(doc, {
          startY: 28,
          head: [['Metric', `Current (${d.month_name}) vs Previous (${d.prev_month_name})`]],
          body: overallBody,
          theme: 'striped',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
      });
      
      let nextY = (doc as any).lastAutoTable.finalY + 10;
      
      // Top Performers section
      doc.setFontSize(12);
      doc.setTextColor(25, 118, 210);
      doc.text('PERFORMANCE HIGHLIGHTS', 14, nextY);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      nextY += 6;
      doc.text(`Good Performance:`, 14, nextY);
      nextY += 5;
      doc.text(`1. Highest calls: ${h.highest_calls.count} attempted by ${h.highest_calls.name}`, 18, nextY);
      nextY += 5;
      doc.text(`2. Highest site visits: ${h.highest_visits.count} done by ${h.highest_visits.name}`, 18, nextY);
      
      nextY += 8;
      doc.text(`Needs Improvement:`, 14, nextY);
      nextY += 5;
      doc.text(`1. Fewest calls: ${h.lowest_calls.count} made by ${h.lowest_calls.name}`, 18, nextY);
      nextY += 5;
      doc.text(`2. Least site visits: ${h.lowest_visits.count} done by ${h.lowest_visits.name}`, 18, nextY);
      
      // Next page for individual performance
      doc.addPage();
      doc.setFontSize(12);
      doc.setTextColor(25, 118, 210);
      doc.text('INDIVIDUAL PERFORMANCE', 14, 15);
      
      const indivBody = this.monthlyReportIndividuals.map(indiv => [
          indiv.name,
          `${indiv.curr.leads_received} (${d.prev_month_name}: ${indiv.prev.leads_received})`,
          `${indiv.curr.site_visits} (${d.prev_month_name}: ${indiv.prev.site_visits})`,
          `${indiv.curr.calls_attempted} (${d.prev_month_name}: ${indiv.prev.calls_attempted})`,
          `${indiv.curr.deals_closed} (${d.prev_month_name}: ${indiv.prev.deals_closed})`
      ]);
      
      autoTable(doc, {
          startY: 20,
          head: [['Employee', 'Leads Received', 'Site Visits', 'Calls Attempted', 'Deals Closed']],
          body: indivBody,
          theme: 'grid'
      });
      
      doc.save(`monthly_performance_report_${d.month_name}_${d.year}.pdf`);
  }
}
