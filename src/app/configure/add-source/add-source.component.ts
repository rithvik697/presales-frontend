import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

interface LeadSourceItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-add-source',
  templateUrl: './add-source.component.html',
  styleUrls: ['./add-source.component.css']
})
export class AddSourceComponent {
  sourceName: string = '';
  sourceCategory: string = '';
  sourceDescription: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  sourceCategories: string[] = ['Online', 'Offline'];

  sources: LeadSourceItem[] = [
    { id: 'S001', name: 'Google', category: 'Online', description: '' },
    { id: 'S002', name: 'Website', category: 'Online', description: '' },
    { id: 'S003', name: 'Walk-in', category: 'Offline', description: '' }
  ];

  saveSource(): void {
    const name = this.sourceName.trim();
    const category = this.sourceCategory.trim();
    const description = this.sourceDescription.trim();

    this.successMessage = '';
    this.errorMessage = '';

    if (!name) {
      this.errorMessage = 'Source name is required.';
      return;
    }

    if (!category) {
      this.errorMessage = 'Source category is required.';
      return;
    }

    const duplicate = this.sources.some(
      (source) => source.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      this.errorMessage = 'This source already exists in the list.';
      return;
    }

    this.sources.push({
      id: this.getNextSourceId(),
      name,
      category,
      description
    });

    this.successMessage = `Source "${name}" added successfully.`;
    this.sourceName = '';
    this.sourceCategory = '';
    this.sourceDescription = '';
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  private getNextSourceId(): string {
    const maxId = Math.max(
      ...this.sources.map((source) => Number(source.id.replace('S', '')))
    );

    return `S${(maxId + 1).toString().padStart(3, '0')}`;
  }
}
