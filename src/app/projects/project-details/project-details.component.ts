import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

  projectId!: string;
  project: any = null;
  loading = true;
  breadcrumbItems!: MenuItem[];
  home!: MenuItem;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.loadProject();
    });
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.breadcrumbItems = [
          { label: 'Projects', routerLink: '/projects' },
          { label: this.project.project_name }
        ];
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load project details');
        this.loading = false;
        this.router.navigate(['/projects']);
      }
    });
  }

  editProject(): void {
    this.router.navigate(['/projects/edit', this.projectId]);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'RERA_APPROVED': return 'success';
      case 'COMPLETED': return 'info';
      case 'PRE_LAUNCH': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'RERA_APPROVED': return 'RERA APPROVED';
      case 'COMPLETED': return 'COMPLETED';
      case 'PRE_LAUNCH': return 'PRE LAUNCH';
      default: return status;
    }
  }
}
