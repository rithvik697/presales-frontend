import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService, LeadStatusOption } from '../../services/configure.service';

interface ActivityStatusItem {
  id: string;
  name: string;
  category: string;
  pipelineOrder: number;
  description: string;
}

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.component.html',
  styleUrls: ['./add-activity.component.css']
})
export class AddActivityComponent implements OnInit {

  activityStatus: string = '';
  pipelineOrder: number | null = null;
  activityDescription: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  activityStatuses: ActivityStatusItem[] = [];

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStatuses();
  }

  loadStatuses(): void {
    this.configureService.getLeadStatuses().subscribe({
      next: (statuses: LeadStatusOption[]) => {
        this.activityStatuses = statuses.map((status) => ({
          id: status.status_id,
          name: status.status_name,
          category: status.status_category || 'ACTIVE',
          pipelineOrder: status.pipeline_order || 0,
          description: status.description || ''
        })).sort((a, b) => b.pipelineOrder - a.pipelineOrder);
        this.pipelineOrder = this.getNextPipelineOrder();
      },
      error: () => {
        this.errorMessage = 'Failed to load activity statuses.';
      }
    });
  }

  saveActivity(form: NgForm) {
    const name = this.activityStatus.trim();
    const description = this.activityDescription.trim();
    const order = Number(this.pipelineOrder);

    this.successMessage = '';
    this.errorMessage = '';

    if (!name) {
      this.errorMessage = 'Activity status is required.';
      return;
    }

    if (!order || order < 1) {
      this.errorMessage = 'Pipeline order is required.';
      return;
    }

    this.configureService.createLeadStatus({
      status_name: name,
      description,
      pipeline_order: order
    }).subscribe({
      next: () => {
        this.toastr.success(`Activity status "${name}" added successfully.`);
        this.successMessage = `Activity status "${name}" added successfully.`;
        form.resetForm();
        this.loadStatuses();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to save activity status.';
      }
    });
  }

  deleteActivity(statusId: string): void {
    this.configureService.deleteLeadStatus(statusId).subscribe({
      next: () => {
        this.toastr.success('Activity status deleted successfully.');
        this.loadStatuses();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to delete activity status.';
      }
    });
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.pipelineOrder = this.getNextPipelineOrder();
    this.successMessage = '';
    this.errorMessage = '';
  }

  private getNextPipelineOrder(): number {
    if (!this.activityStatuses.length) return 1;
    return Math.max(...this.activityStatuses.map((status) => status.pipelineOrder)) + 1;
  }
}
