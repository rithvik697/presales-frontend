import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ConfigureService,
  ProjectAssignment,
  ProjectOption,
  SalesExecutiveOption
} from '../../services/configure.service';

@Component({
  selector: 'app-project-assignment',
  templateUrl: './project-assignment.component.html',
  styleUrls: ['./project-assignment.component.css']
})
export class ProjectAssignmentComponent implements OnInit {
  projects: ProjectOption[] = [];
  salesExecutives: SalesExecutiveOption[] = [];
  assignments: ProjectAssignment[] = [];

  selectedProjectId = '';
  selectedEmpId = '';

  loading = false;
  saving = false;

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading = true;

    this.configureService.getProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: () => this.toastr.error('Failed to load projects')
    });

    this.configureService.getActiveSalesExecutives().subscribe({
      next: (users) => this.salesExecutives = users,
      error: () => this.toastr.error('Failed to load sales executives')
    });

    this.loadAssignments();
  }

  loadAssignments(): void {
    this.configureService.getProjectAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.error || 'Failed to load project assignments');
      }
    });
  }

  saveAssignment(): void {
    if (!this.selectedProjectId || !this.selectedEmpId) {
      this.toastr.warning('Please select both a project and a sales executive');
      return;
    }

    this.saving = true;
    this.configureService.createProjectAssignment({
      project_id: this.selectedProjectId,
      emp_id: this.selectedEmpId
    }).subscribe({
      next: () => {
        this.toastr.success('Project assignment saved');
        this.selectedProjectId = '';
        this.selectedEmpId = '';
        this.saving = false;
        this.loadAssignments();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.error || 'Failed to save assignment');
      }
    });
  }

  removeAssignment(mappingId: number): void {
    this.configureService.deleteProjectAssignment(mappingId).subscribe({
      next: () => {
        this.toastr.success('Assignment removed');
        this.loadAssignments();
      },
      error: (err) => this.toastr.error(err?.error?.error || 'Failed to remove assignment')
    });
  }
}
