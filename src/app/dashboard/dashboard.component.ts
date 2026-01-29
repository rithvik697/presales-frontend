import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  leads = [
    {
      customer: 'Customer',
      mobile: '8179790...',
      source: 'Mcube',
      project: 'The Patio',
      activity: 'New Enquiry',
      scheduled: '29-10-2025',
      employee: 'Madhan',
    },
    {
      customer: 'Customer',
      mobile: '6301252...',
      source: 'Mcube',
      project: 'The Patio',
      activity: 'New Enquiry',
      scheduled: '29-10-2025',
      employee: 'Prabha',
    },
    {
      customer: 'Customer',
      mobile: '8421695...',
      source: 'Mcube',
      project: 'The Patio',
      activity: 'New Enquiry',
      scheduled: '29-10-2025',
      employee: 'Prasad',
    },
    {
      customer: 'Praveen Kumar',
      mobile: '9866655...',
      source: 'Exhibition',
      project: 'The Patio',
      activity: 'New Enquiry',
      scheduled: '30-10-2025',
      employee: 'Prashanth',
    },
    {
      customer: 'Harsha',
      mobile: '8341877...',
      source: 'Exhibition',
      project: 'The Patio',
      activity: 'New Enquiry',
      scheduled: '30-10-2025',
      employee: 'Prashanth',
    },
  ];
}