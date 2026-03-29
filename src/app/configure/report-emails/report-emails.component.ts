import { Component, OnInit } from '@angular/core';
import { ConfigureService, ReportEmailRecipient } from '../../services/configure.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-report-emails',
  templateUrl: './report-emails.component.html',
  styleUrls: ['./report-emails.component.css']
})
export class ReportEmailRecipientsComponent implements OnInit {

  recipients: ReportEmailRecipient[] = [];
  loading = true;

  // Form
  recipientName = '';
  recipientEmail = '';
  weeklyReport = true;
  monthlyReport = true;
  quarterlyReport = true;
  annualReport = true;

  successMessage = '';
  errorMessage = '';

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRecipients();
  }

  loadRecipients(): void {
    this.loading = true;
    this.configureService.getReportEmailRecipients().subscribe({
      next: (data) => {
        this.recipients = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load recipients');
        this.loading = false;
      }
    });
  }

  saveRecipient(form: NgForm): void {
    const name = this.recipientName.trim();
    const email = this.recipientEmail.trim();

    if (!name || !email) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    this.errorMessage = '';
    this.configureService.addReportEmailRecipient({
      recipient_name: name,
      email: email,
      weekly_report: this.weeklyReport,
      monthly_report: this.monthlyReport,
      quarterly_report: this.quarterlyReport,
      annual_report: this.annualReport
    }).subscribe({
      next: () => {
        this.toastr.success('Recipient added');
        form.resetForm();
        this.weeklyReport = true;
        this.monthlyReport = true;
        this.quarterlyReport = true;
        this.annualReport = true;
        this.loadRecipients();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to add recipient';
      }
    });
  }

  toggleField(recipient: ReportEmailRecipient, field: string): void {
    const currentValue = (recipient as any)[field];
    this.configureService.updateReportEmailRecipient(recipient.id, {
      [field]: !currentValue
    }).subscribe({
      next: (res) => {
        (recipient as any)[field] = !currentValue;
      },
      error: () => {
        this.toastr.error('Failed to update');
      }
    });
  }

  deleteRecipient(id: number): void {
    this.configureService.deleteReportEmailRecipient(id).subscribe({
      next: () => {
        this.toastr.success('Recipient removed');
        this.loadRecipients();
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Failed to remove');
      }
    });
  }
}
