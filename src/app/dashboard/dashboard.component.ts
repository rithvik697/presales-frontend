import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  fullName: string = '';
  greeting: string = '';

  // Stats
  totalLeads: number = 0;
  activeLeads: number = 0;
  closedDeals: number = 0;
  todayLeads: number = 0;
  siteVisits: number = 0;

  loading: boolean = true;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'User';
    this.greeting = this.getGreeting();
    this.loadSummary();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  loadSummary(): void {
    this.reportsService.getSummary().subscribe({
      next: (res: any) => {
        if (res?.success && res.data) {
          this.totalLeads = res.data.total_leads || 0;
          this.activeLeads = res.data.active_leads || 0;
          this.closedDeals = res.data.closed_leads || 0;
          this.todayLeads = res.data.today_leads || 0;
          this.siteVisits = res.data.site_visits || 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
