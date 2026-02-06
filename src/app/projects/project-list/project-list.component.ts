import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project-registration.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  loading = true;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
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
}

