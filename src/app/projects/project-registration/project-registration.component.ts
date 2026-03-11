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

  originalStatus: string = '';
  originalProjectData: any = {};

  projectData: any = {
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
    created_by: ''
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    // Load status options
    this.projectService.getProjectStatusOptions().subscribe({
      next: (res) => this.projectStatuses = res,
      error: () => this.toastr.error('Failed to load status options')
    });

    // Load project types
    this.projectService.getProjectTypeOptions().subscribe({
      next: (res) => this.projectTypes = res,
      error: () => this.toastr.error('Failed to load project types')
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

      const statusChanged = this.originalStatus !== selectedStatus;

      const otherFieldsChanged =
        this.projectData.project_name !== this.originalProjectData.project_name ||
        this.projectData.project_type !== this.originalProjectData.project_type ||
        this.projectData.location !== this.originalProjectData.location ||
        this.projectData.address_line_1 !== this.originalProjectData.address_line_1 ||
        this.projectData.city !== this.originalProjectData.city ||
        this.projectData.state !== this.originalProjectData.state ||
        this.projectData.pincode !== this.originalProjectData.pincode ||
        this.projectData.total_area !== this.originalProjectData.total_area ||
        this.projectData.number_of_units !== this.originalProjectData.number_of_units ||
        this.projectData.rera_number !== this.originalProjectData.rera_number;

      // CASE 1: fields changed
      if (otherFieldsChanged) {

        this.projectService.updateProject(this.projectId, updatePayload)
          .subscribe({

            next: () => {

              if (statusChanged) {

                this.projectService.updateProjectStatus(this.projectId, selectedStatus)
                  .subscribe({
                    next: () => this.successNavigate(),
                    error: (err) => this.handleError(err)
                  });

              } else {

                this.successNavigate();

              }

            },

            error: (err) => this.handleError(err)

          });

      }

      // CASE 2: only status changed
      else if (statusChanged) {

        this.projectService.updateProjectStatus(this.projectId, selectedStatus)
          .subscribe({
            next: () => this.successNavigate(),
            error: (err) => this.handleError(err)
          });

      }

      // CASE 3: nothing changed
      else {

        this.toastr.info('No changes detected');
        this.isSubmitting = false;

      }

    }

    else {

      this.projectService.createProject(this.projectData)
        .subscribe({
          next: () => this.successNavigate(),
          error: (err) => this.handleError(err)
        });

    }

  }

  loadProject(id: string) {

    this.projectService.getProjectById(id).subscribe({

      next: (res) => {

        this.projectData = res;

        this.originalStatus = res.status;

        this.originalProjectData = { ...res };

      },

      error: () => {

        this.toastr.error('Failed to load project details');

      }

    });

  }

  successNavigate() {

    this.toastr.success('Project saved successfully');
    this.router.navigate(['/projects']);

  }

  handleError(err: any) {

    this.errorMessage = err?.error?.error || 'Operation failed';
    this.toastr.error(this.errorMessage);
    this.isSubmitting = false;

  }

}