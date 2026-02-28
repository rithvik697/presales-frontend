import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';
import { MenuItem } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-registration',
  templateUrl: './project-registration.component.html',
  styleUrls: ['./project-registration.component.css']
})
export class ProjectRegistrationComponent {
  
  breadcrumbItems!: MenuItem[];
  home!: MenuItem;
  isEditMode = false;
  projectId!: string;
  projectStatuses: any[] = [];
  projectTypes: any[] = [];

  ngOnInit(): void {
  this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

  // Load status options
  this.projectService.getProjectStatusOptions().subscribe({
    next: (res) => {
      this.projectStatuses = res;
    },
    error: () => {
      this.toastr.error('Failed to load status options');
    }
  });

  // Load type options
  this.projectService.getProjectTypeOptions().subscribe({
    next: (res) => {
      this.projectTypes = res;
    },
    error: () => {
      this.toastr.error('Failed to load project types');
    }
  });

  // Edit mode check
  this.route.params.subscribe(params => {
    if (params['id']) {
      this.isEditMode = true;
      this.projectId = params['id'];
      this.loadProject(this.projectId);
    }
  });

  this.breadcrumbItems = [
    { label: 'Project', routerLink: '/projects' },
    { label: this.isEditMode ? 'Edit Project' : 'Register Project' }
  ];
}
  projectData = {
    project_name: '',
    project_type: '',
    status: '',
    location: '',
    address_line_1: '',
    city: '',
    state: '',
    pincode: '',
    total_area: null,
    number_of_units: null,
    rera_number: '',
    created_by: '' // later from auth
  };


  isSubmitting = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

 submitProject() {
  this.isSubmitting = true;
  this.errorMessage = '';

  if (this.isEditMode) {

    const selectedStatus = this.projectData.status;

    const updatePayload: any = { ...this.projectData };

    delete updatePayload.project_id;
    delete updatePayload.created_on;
    delete updatePayload.modified_on;
    delete updatePayload.status;

    // 1️⃣ Update general fields
    this.projectService.updateProject(this.projectId, updatePayload)
      .subscribe({
        next: () => {

          // 2️⃣ Update status separately
          this.projectService.updateProjectStatus(this.projectId, selectedStatus)
            .subscribe({
              next: () => {
                this.toastr.success('Project updated successfully');
                this.router.navigate(['/projects']);
              },
              error: (err) => {
                this.errorMessage = err?.error?.error || 'Status update failed';
                this.toastr.error(this.errorMessage);
                this.isSubmitting = false;
              }
            });

        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Update failed';
          this.toastr.error(this.errorMessage);
          this.isSubmitting = false;
        }
      });

  } else {

    this.projectService.createProject(this.projectData)
      .subscribe({
        next: () => {
          this.toastr.success('Project created successfully');
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Something went wrong';
          this.toastr.error(this.errorMessage);
          this.isSubmitting = false;
        }
      });
  }
}
  
  loadProject(id: string) {
    this.projectService.getProjectById(id).subscribe({
      next: (res) => {
      this.projectData = res;
    },
    error: () => {
      this.toastr.error('Failed to load project details');
    }
    });
  }
  
  
}

