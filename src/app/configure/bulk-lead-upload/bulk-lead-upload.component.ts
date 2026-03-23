import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  BulkUploadHistoryItem,
  BulkUploadResult,
  ConfigureService
} from '../../services/configure.service';

@Component({
  selector: 'app-bulk-lead-upload',
  templateUrl: './bulk-lead-upload.component.html',
  styleUrls: ['./bulk-lead-upload.component.css']
})
export class BulkLeadUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadResult: BulkUploadResult | null = null;
  uploadHistory: BulkUploadHistoryItem[] = [];
  loadingHistory = false;
  uploading = false;

  readonly acceptedFormats = '.csv,.xlsx';

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    this.selectedFile = file;
    this.uploadResult = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please select a .csv or .xlsx file');
      return;
    }

    this.uploading = true;
    this.configureService.uploadBulkLeads(this.selectedFile).subscribe({
      next: (result) => {
        this.uploadResult = result;
        this.uploading = false;
        this.toastr.success(`Bulk upload completed. ${result.created_count} lead(s) created`);
        this.selectedFile = null;
        this.loadHistory();
      },
      error: (err) => {
        this.uploading = false;
        this.toastr.error(err?.error?.error || 'Failed to upload leads');
      }
    });
  }

  loadHistory(): void {
    this.loadingHistory = true;
    this.configureService.getBulkUploadHistory().subscribe({
      next: (history) => {
        this.uploadHistory = history;
        this.loadingHistory = false;
      },
      error: () => {
        this.loadingHistory = false;
        this.toastr.error('Failed to load upload history');
      }
    });
  }

  resetSelection(fileInput: HTMLInputElement): void {
    this.selectedFile = null;
    this.uploadResult = null;
    fileInput.value = '';
  }
}
