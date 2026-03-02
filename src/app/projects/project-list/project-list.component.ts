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

  statusSeverityMap: { [key: string]: string } = {
  RERA_APPROVED: 'success',   // Green
  COMPLETED: 'info',          // Blue
  PRE_LAUNCH: 'warning'       // Orange
  };

  getStatusSeverity(status: string): string {
    return this.statusSeverityMap[status] || 'secondary';
  }
  openEditDialog(project: any) {
  this.router.navigate(['/projects/edit', project.project_id]);
}

  viewProjectDetails(project: any) {
    this.router.navigate(['/projects', project.project_id]);
  }

  formatStatus(status: string): string {
  return status.replace('_', ' ');
 }
}
