import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  loading = true;

  // 👉 Breadcrumbs
  breadcrumbItems: MenuItem[] = [];
  home!: MenuItem;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.loadProjects();
  }

  setupBreadcrumbs() {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [
      { label: 'Project' }
    ];
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/projects/register']);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pre-Launch':
        return 'warning';
      case 'Inactive':
        return 'danger';
      default:
        return 'info';
    }
  }
  openEditDialog(project: any) {
  // opens PrimeNG dialog
  }
}
