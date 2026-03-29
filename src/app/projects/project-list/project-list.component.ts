import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  loading = true;
  canManageProjects = false;
  isAdmin = false;

  // Delete confirmation
  showDeleteConfirm = false;
  projectToDelete: any = null;

  // 👉 Breadcrumbs
  breadcrumbItems: MenuItem[] = [];
  home!: MenuItem;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role') || '';
    this.canManageProjects = ['ADMIN', 'SALES_MGR'].includes(role);
    this.isAdmin = role === 'ADMIN';
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
        this.toastr.error('Failed to load projects');
        this.loading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/configure/add-project']);
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'RERA_APPROVED':
        return 'success';    // Green
      case 'COMPLETED':
        return 'info';       // Blue
      case 'PRE_LAUNCH':
        return 'warning';    // Orange
      default:
        return 'secondary';  // Gray
    }
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

  confirmDelete(project: any): void {
    this.projectToDelete = project;
    this.showDeleteConfirm = true;
  }

  deleteProject(): void {
    if (!this.projectToDelete) return;
    this.projectService.deleteProject(this.projectToDelete.project_id).subscribe({
      next: () => {
        this.toastr.success('Project deleted successfully');
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
        this.loadProjects();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Failed to delete project');
        this.showDeleteConfirm = false;
      }
    });
  }
}
