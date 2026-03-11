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
  userPerformance: any[] = [];

  downloadMenuItems: any[] = [];
  perfDownloadMenuItems: any[] = [];
  dailyDownloadMenuItems: any[] = [];

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
            this.userPerformance = res.data.filter((u: any) => u.user_name !== 'Unassigned');
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
    const headers = ['User Name', 'Completed (Deals Closed)', 'Ongoing (Pipeline)', 'Failed (Lost/Spam)'];
    const csvContent = [
      headers.join(','),
      ...this.userPerformance.map(row => 
        `"${row.user_name}","${row.completed}","${row.ongoing}","${row.failed}"`
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
    const body = this.userPerformance.map(row => [row.user_name, row.completed, row.ongoing, row.failed]);
    autoTable(doc, {
      head: [['User Name', 'Completed (Deals Closed)', 'Ongoing (Pipeline)', 'Failed (Lost/Spam)']],
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
}
