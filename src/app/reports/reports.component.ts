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

  currentFilter: 'weekly' | 'monthly' | 'annual' = 'weekly';
  lineChart: any;
  pieChart: any;

  startDate: string = '';
  endDate: string = '';
  selectedProject: string = '';
  selectedUser: string = '';

  usersList: any[] = [];
  projectsList: any[] = [];

  dailyLog: any[] = [];
  weeklyLog: any[] = [];
  userPerformance: any[] = [];

  downloadMenuItems: any[] = [];
  perfDownloadMenuItems: any[] = [];
  dailyDownloadMenuItems: any[] = [];
  weeklyDownloadMenuItems: any[] = [];
  monthlyDownloadMenuItems: any[] = [];

  // Dialog State
  displaySummaryDialog: boolean = false;
  summaryDialogTitle: string = '';
  summaryDialogData: any[] = [];
  loadingSummaryData: boolean = false;

  // Monthly Performance Report State
  monthlyReportDialogVisible: boolean = false;
  monthlyReportData: any = null;
  monthlyReportIndividuals: any[] = [];
  loadingMonthlyReport: boolean = false;
  showIndividualPerf: boolean = false;

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

    this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.selectedUser = params['userId'];
      }
      this.loadDropdownData();
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    this.loadLineChartData();
    this.loadPieChartData();
  }

  loadDropdownData() {
    this.leadsService.getEmployees().subscribe({
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
  }

  loadSummary() {
    this.reportsService.getSummary(this.startDate, this.endDate, this.selectedProject, this.selectedUser).subscribe({
      next: (res) => {
        if(res.success) {
          this.summary = res.data;
        }
      },
      error: (err) => console.error(err)
    });
  }

  applyFilters() {
    this.loadSummary();
    this.loadLineChartData();
    this.loadPieChartData();
    this.loadUserPerformance();
    this.loadDailyLog();
    this.loadWeeklyLog();
    this.loadMonthlyReport();
  }

  clearFilters() {
    this.selectedUser = '';
    this.selectedProject = '';
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

  setFilter(filter: 'weekly' | 'monthly' | 'annual') {
    this.currentFilter = filter;
    this.loadLineChartData();
  }

  loadLineChartData() {
    if (!this.lineChartCanvas) return; // guard against init timing

    let call;
    let label = '';
    let xKey = '';
    
    if (this.currentFilter === 'weekly') {
      call = this.reportsService.getWeeklyReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser);
      label = 'Leads Created (Last 7 Days)';
      xKey = 'date';
    } else if (this.currentFilter === 'monthly') {
      call = this.reportsService.getMonthlyReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser);
      label = 'Leads Created (Last 30 Days)';
      xKey = 'date';
    } else {
      call = this.reportsService.getAnnualReport(this.startDate, this.endDate, this.selectedProject, this.selectedUser);
      label = 'Leads Created (Monthly this Year)';
      xKey = 'month';
    }

    call.subscribe({
      next: (res) => {
        if(res.success) {
          const labels = res.data.map((d: any) => d[xKey]);
          const data = res.data.map((d: any) => d.leads);
          this.renderLineChart(labels, data, label);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadPieChartData() {
    if (!this.pieChartCanvas) return;

    this.reportsService.getStatusDistribution(this.startDate, this.endDate, this.selectedProject, this.selectedUser).subscribe({
      next: (res) => {
        if(res.success) {
          const labels = res.data.map((d: any) => d.status_name || 'Unknown');
          const data = res.data.map((d: any) => d.leads);
          this.renderPieChart(labels, data);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadUserPerformance() {
    this.reportsService.getUserPerformance(this.startDate, this.endDate, this.selectedProject, this.selectedUser).subscribe({
      next: (res) => {
         if(res.success) {
            this.userPerformance = res.data
              .filter((u: any) => u.user_name !== 'Unassigned')
              .map((u: any) => ({
                ...u,
                downloadMenuItems: this.getDownloadMenu(u)
              }));
         }
      },
      error: (err) => console.error(err)
    });
  }

  loadDailyLog() {
      this.reportsService.getDailyLog(this.selectedProject, this.selectedUser).subscribe({
          next: (res) => {
              if(res.success) {
                  this.dailyLog = res.data;
              }
          },
          error: (err) => console.error(err)
      })
  }

  loadWeeklyLog() {
      this.reportsService.getWeeklyLog(this.startDate, this.endDate, this.selectedProject, this.selectedUser).subscribe({
          next: (res: any) => {
              if (res.success) {
                  this.weeklyLog = res.data;
              }
          },
          error: (err: any) => console.error(err)
      });
  }

  renderLineChart(labels: string[], data: number[], datasetLabel: string) {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'bar',
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
    const headers = ['EMP ID', 'User Name', 'Total Assigned', 'Site Visit Done', 'Office Visit Done', 'Pipeline', 'Deals Closed', 'Spam'];
    const csvContent = [
      headers.join(','),
      ...this.userPerformance.map(row => 
        `"${row.emp_id}","${row.user_name}","${row.total_assigned}","${row.site_visit_done}","${row.office_visit_done}","${row.pipeline}","${row.deals_closed}","${row.spam}"`
      )
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
    const body = this.userPerformance.map(row => [
      row.emp_id || 'N/A', row.user_name, row.total_assigned, row.site_visit_done, row.office_visit_done, row.pipeline, row.deals_closed, row.spam
    ]);
    autoTable(doc, {
      head: [['EMP ID', 'User Name', 'Total Assigned', 'Site Visit Done', 'Office Visit Done', 'Pipeline', 'Deals Closed', 'Spam']],
      body: body,
      startY: 20
    });
    doc.save('user_performance.pdf');
  }

  downloadDailyLogCsv() {
    if (!this.dailyLog || this.dailyLog.length === 0) return;
    const headers = ['Lead ID', 'Description', 'Created On', 'Assigned User', 'Project', 'Status'];
    const csvContent = [
      headers.join(','),
      ...this.dailyLog.map(row => 
        `"${row.lead_id}","${row.lead_description}","${row.created_on}","${row.employee_name}","${row.project_name}","${row.label || 'Unknown'}"`
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
      row.lead_description, 
      row.created_on, 
      row.employee_name, 
      row.project_name, 
      row.label || 'Unknown'
    ]);

    autoTable(doc, {
      head: [['Lead ID', 'Description', 'Created On', 'Assigned User', 'Project', 'Status']],
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
      this.reportsService.downloadUserLeads(empId, userName, activity, this.startDate, this.endDate, this.selectedProject).subscribe({
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
      this.reportsService.getUserLeadsJson(empId, userName, activity, this.startDate, this.endDate, this.selectedProject).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const doc = new jsPDF();
            doc.text(`User Leads Report - ${activity}`, 14, 15);
            doc.setFontSize(10);
            doc.text(`EMP ID: ${empId || 'N/A'} | User Name: ${userName}`, 14, 22);
            
            const columns = ["Lead ID", "Lead Name", "Activity Status", "Description", "Project", "Created On", "Current Status"];
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
    
    // Check if we have specific filters applied
    const userId = this.selectedUser || undefined;
    const projId = this.selectedProject || undefined;

    this.reportsService.getSummaryLeads(type, this.startDate, this.endDate, projId, userId).subscribe({
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
                        name: ic.name,
                        curr: ic,
                        prev: ip
                    };
                });
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
