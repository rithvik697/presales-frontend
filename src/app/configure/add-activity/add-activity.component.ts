import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

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
export class AddActivityComponent {

  activityStatus: string = '';
  pipelineOrder: number | null = null;
  activityDescription: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  activityStatuses: ActivityStatusItem[] = [
    { id: 'ST001', name: 'New Enquiry', category: 'ACTIVE', pipelineOrder: 1, description: '' },
    { id: 'ST004', name: 'Phone Call', category: 'ACTIVE', pipelineOrder: 2, description: '' },
    { id: 'ST005', name: 'WhatsApp', category: 'ACTIVE', pipelineOrder: 3, description: '' },
    { id: 'ST006', name: 'Offline Lead', category: 'ACTIVE', pipelineOrder: 4, description: '' },
    { id: 'ST007', name: 'NRI', category: 'ACTIVE', pipelineOrder: 5, description: '' },
    { id: 'ST008', name: 'Re-Enquire', category: 'ACTIVE', pipelineOrder: 6, description: '' },
    { id: 'ST009', name: 'Expected Site Visit', category: 'ACTIVE', pipelineOrder: 7, description: '' },
    { id: 'ST003', name: 'Site Visit Done', category: 'ACTIVE', pipelineOrder: 8, description: '' },
    { id: 'ST010', name: 'Expected Office Visit', category: 'ACTIVE', pipelineOrder: 9, description: '' },
    { id: 'ST011', name: 'Office Visit Done', category: 'ACTIVE', pipelineOrder: 10, description: '' },
    { id: 'ST012', name: 'Pipeline', category: 'ACTIVE', pipelineOrder: 11, description: '' },
    { id: 'ST013', name: 'Deal Closed', category: 'ACTIVE', pipelineOrder: 12, description: '' },
    { id: 'ST014', name: 'Sq. Yards Concern', category: 'ACTIVE', pipelineOrder: 13, description: '' },
    { id: 'ST015', name: 'Sq. Feet Concern', category: 'ACTIVE', pipelineOrder: 14, description: '' },
    { id: 'ST016', name: 'Distance Concern', category: 'ACTIVE', pipelineOrder: 15, description: '' },
    { id: 'ST017', name: 'OTP', category: 'ACTIVE', pipelineOrder: 16, description: '' },
    { id: 'ST018', name: '50:50', category: 'ACTIVE', pipelineOrder: 17, description: '' },
    { id: 'ST019', name: 'Pre-Launch', category: 'ACTIVE', pipelineOrder: 18, description: '' },
    { id: 'ST020', name: 'Not Answered', category: 'ACTIVE', pipelineOrder: 19, description: '' },
    { id: 'ST021', name: 'Not Interested', category: 'ACTIVE', pipelineOrder: 20, description: '' },
    { id: 'ST022', name: 'Spam', category: 'ACTIVE', pipelineOrder: 21, description: '' },
    { id: 'ST023', name: 'Low Budget', category: 'ACTIVE', pipelineOrder: 22, description: '' },
    { id: 'ST024', name: 'OOS', category: 'ACTIVE', pipelineOrder: 23, description: '' },
    { id: 'ST002', name: 'Testing', category: 'ACTIVE', pipelineOrder: 24, description: '' },
    { id: 'ST025', name: 'Old Lead', category: 'ACTIVE', pipelineOrder: 25, description: '' }
  ];

  constructor() {
    this.pipelineOrder = this.getNextPipelineOrder();
  }

  saveActivity() {
    const name = this.activityStatus.trim();
    const description = this.activityDescription.trim();
    const order = Number(this.pipelineOrder);

    this.successMessage = '';
    this.errorMessage = '';

    if (!name) {
      this.errorMessage = 'Activity status is required.';
      return;
    }

    const isDuplicate = this.activityStatuses.some(
      (status) => status.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      this.errorMessage = 'This activity status already exists in the list.';
      return;
    }

    if (!order || order < 1) {
      this.errorMessage = 'Pipeline order is required.';
      return;
    }

    const isOrderUsed = this.activityStatuses.some(
      (status) => status.pipelineOrder === order
    );

    if (isOrderUsed) {
      this.errorMessage = 'Pipeline order already exists. Choose a different order.';
      return;
    }

    this.activityStatuses.push({
      id: this.getNextStatusId(),
      name,
      category: 'ACTIVE',
      pipelineOrder: order,
      description
    });

    this.activityStatuses.sort((a, b) => a.pipelineOrder - b.pipelineOrder);
    this.successMessage = `Activity status "${name}" added successfully.`;
    this.activityStatus = '';
    this.pipelineOrder = this.getNextPipelineOrder();
    this.activityDescription = '';
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.pipelineOrder = this.getNextPipelineOrder();
    this.successMessage = '';
    this.errorMessage = '';
  }

  private getNextPipelineOrder(): number {
    return Math.max(...this.activityStatuses.map((status) => status.pipelineOrder)) + 1;
  }

  private getNextStatusId(): string {
    const maxId = Math.max(
      ...this.activityStatuses.map((status) => Number(status.id.replace('ST', '')))
    );

    return `ST${(maxId + 1).toString().padStart(3, '0')}`;
  }

}
