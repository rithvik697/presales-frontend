import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ReportsService } from '../services/reports.service';
import { LeadsService } from '../services/leads.service';
import { ProjectService } from '../services/project-registration.service';
import { Chart, registerables } from 'chart.js/auto';

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

  userPerformance: any[] = [];
  dailyLog: any[] = [];

  constructor(
      private reportsService: ReportsService,
      private leadsService: LeadsService,
      private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.applyFilters();
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
}
