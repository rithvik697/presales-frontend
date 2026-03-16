import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService, LeadSourceOption } from '../../services/configure.service';

interface LeadSourceItem {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-add-source',
  templateUrl: './add-source.component.html',
  styleUrls: ['./add-source.component.css']
})
export class AddSourceComponent implements OnInit {
  sourceName: string = '';
  sourceDescription: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  sources: LeadSourceItem[] = [];

  constructor(
    private configureService: ConfigureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSources();
  }

  loadSources(): void {
    this.configureService.getLeadSources().subscribe({
      next: (sources: LeadSourceOption[]) => {
        this.sources = sources.map((source) => ({
          id: source.source_id,
          name: source.source_name,
          description: source.description || ''
        })).sort((a, b) => b.id.localeCompare(a.id));
      },
      error: () => {
        this.errorMessage = 'Failed to load sources.';
      }
    });
  }

  saveSource(form: NgForm): void {
    const name = this.sourceName.trim();
    const description = this.sourceDescription.trim();

    this.successMessage = '';
    this.errorMessage = '';

    if (!name) {
      this.errorMessage = 'Source name is required.';
      return;
    }

    this.configureService.createLeadSource({
      source_name: name,
      description
    }).subscribe({
      next: () => {
        this.toastr.success(`Source "${name}" added successfully.`);
        this.successMessage = `Source "${name}" added successfully.`;
        form.resetForm();
        this.loadSources();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to save source.';
      }
    });
  }

  deleteSource(sourceId: string): void {
    this.configureService.deleteLeadSource(sourceId).subscribe({
      next: () => {
        this.toastr.success('Source deleted successfully.');
        this.loadSources();
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to delete source.';
      }
    });
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }
}
