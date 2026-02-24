import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-project-registration',
  templateUrl: './project-registration.component.html',
  styleUrls: ['./project-registration.component.css']
})
export class ProjectRegistrationComponent {

  breadcrumbItems!: MenuItem[];
  home!: MenuItem;

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    this.breadcrumbItems = [
      { label: 'Project', routerLink: '/projects' },
      { label: 'Register Project' }
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
    rera_number: ''
    // created_by is NOT sent from the frontend.
    // The backend reads it from the JWT token.
  };

  projectTypes = ['Villa', 'Apartment'];
  projectStatuses = ['Active', 'Inactive', 'Pre-Launch'];

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) { }

  submitProject() {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.createProject(this.projectData).subscribe({
      next: () => {
        alert('Project created successfully');
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Something went wrong';
        this.isSubmitting = false;
      }
    });

  }

}

