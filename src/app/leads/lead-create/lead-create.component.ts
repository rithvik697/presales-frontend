import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { LeadsService } from '../../services/leads.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/services/auth.service';
import { MenuItem } from 'primeng/api';

type CountryCodeOption = {
  code: string;
  label: string;
  max_length: number;
};

@Component({
  selector: 'app-lead-create',
  templateUrl: './lead-create.component.html',
  styleUrls: ['./lead-create.component.css'],
})
export class LeadCreateComponent implements OnInit {
  isEditMode = false;
  isAdmin = false;
  isManager = false;
  leadId: string | null = null;

  model: Lead = {
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    project: '',
    source: '',
    profession: '',
    description: '',
    assignedTo: '',
    status: ''
  };

  projects: any[] = [];
  employees: any[] = [];
  sources: any[] = [];
  statuses: any[] = [];
  countryCodes: CountryCodeOption[] = [];
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };
  selectedCountryCode: CountryCodeOption = {
    code: '+91',
    label: 'India',
    max_length: 10
  };

  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isManager = this.authService.isManager();

    if (!this.isAdmin && !this.isManager) {
      this.model.assignedTo = this.authService.getUserId() || '';
    }

    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.breadcrumbItems = [
        { label: 'Leads', routerLink: '/leads' },
        { label: 'Lead Details', routerLink: ['/leads/details', this.leadId] },
        { label: 'Edit Lead' }
      ];
    } else {
      this.breadcrumbItems = [
        { label: 'Leads', routerLink: '/leads' },
        { label: 'Create Lead' }
      ];
    }

    if (this.isAdmin || this.isManager) {
      this.leadsService.getEmployees('SALES_EXEC').subscribe({
        next: (emps) => (this.employees = emps),
        error: () => this.toastr.error('Failed to load employees')
      });
    }

    this.leadsService.getProjects().subscribe({
      next: (data) => (this.projects = data),
      error: () => this.toastr.error('Failed to load projects')
    });

    this.leadsService.getSources().subscribe({
      next: (data) => (this.sources = data),
      error: () => this.toastr.error('Failed to load sources')
    });

    this.leadsService.getStatuses().subscribe({
      next: (data) => (this.statuses = data),
      error: () => this.toastr.error('Failed to load statuses')
    });

    this.leadsService.getCountryCodes().subscribe({
      next: (codes) => {
        this.countryCodes = codes || [];
        if (this.countryCodes.length > 0) {
          this.selectedCountryCode = this.countryCodes[0];
        }

        if (this.isEditMode && this.leadId) {
          this.loadLead(this.leadId);
        }
      },
      error: () => this.toastr.error('Failed to load country codes')
    });

    // Sources
    this.leadsService.getSources().subscribe({
      next: (data) => this.sources = data,
      error: () => this.toastr.error('Failed to load sources')
    });

    // Statuses
    this.leadsService.getStatuses().subscribe({
      next: (data) => this.statuses = data,
      error: () => this.toastr.error('Failed to load statuses')
    });

  }

  loadLead(id: string): void {
    this.leadsService.getById(id).subscribe({
      next: (lead) => {
        this.model = lead;

        if (lead.projectId) {
          this.model.project = lead.projectId;
        }
        if (lead.sourceId) {
          this.model.source = lead.sourceId;
        }
        if (lead.statusId) {
          this.model.status = lead.statusId;
        }
        if (lead.assignedToId) {
          this.model.assignedTo = lead.assignedToId;
        }

        if (lead.name) {
          const parts = lead.name.split(' ');
          this.model.firstName = parts[0] || '';
          this.model.lastName = parts.slice(1).join(' ') || '';
        }

        // Extract country code from phone
        if (this.model.phone) {
          const phoneStr = String(this.model.phone);
          const found = this.countryCodes
            .sort((a, b) => b.code.length - a.code.length)
            .find(c => {
               const numericCode = c.code.replace('+', '');
               return phoneStr.startsWith(c.code) || 
                      (phoneStr.startsWith(numericCode) && phoneStr.length === c.max_length + numericCode.length);
            });

          if (found) {
            this.selectedCountryCode = found;
            const codeToReplace = phoneStr.startsWith(found.code) ? found.code : found.code.replace('+', '');
            this.model.phone = phoneStr.replace(codeToReplace, '').trim();
          } else {
            this.model.phone = phoneStr;
          }
        }

        if (this.model.alternatePhone) {
          this.model.alternatePhone = String(this.model.alternatePhone);
        }
        this.applyStoredPhoneToForm('phone');
        this.applyStoredPhoneToForm('alternatePhone', false);
      },
      error: () => this.toastr.error('Failed to load lead')
    });
  }

  private applyStoredPhoneToForm(field: 'phone' | 'alternatePhone', updateSelectedCode = true): void {
    const value = String(this.model[field] || '');
    if (!value || this.countryCodes.length === 0) {
      return;
    }

    const found = [...this.countryCodes]
      .sort((a, b) => b.code.length - a.code.length)
      .find((c) => {
         const numericCode = c.code.replace('+', '');
         return value.startsWith(c.code) || 
                (value.startsWith(numericCode) && value.length === c.max_length + numericCode.length);
      });

    if (!found) {
      return;
    }

    if (updateSelectedCode) {
      this.selectedCountryCode = found;
    }

    const toReplace = value.startsWith(found.code) ? found.code : found.code.replace('+', '');
    this.model[field] = value.replace(toReplace, '').trim();
  }

  onPhoneInput(event: Event, isMain: boolean): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    const limit = this.selectedCountryCode.max_length;

    if (value.length > limit) {
      value = value.slice(0, limit);
    }

    if (isMain) {
      this.model.phone = value;
    } else {
      this.model.alternatePhone = value;
    }

    input.value = value;
  }

  submit(): void {
    if (!this.model.phone) {
      this.toastr.error('Phone number is required');
      return;
    }

    if (this.model.phone.length !== this.selectedCountryCode.max_length) {
      this.toastr.error(
        `Phone number must be exactly ${this.selectedCountryCode.max_length} digits`
      );
      return;
    }

    this.model.name = `${this.model.firstName} ${this.model.lastName}`.trim();

    const submissionModel: any = { ...this.model };
    submissionModel.phone = `${this.selectedCountryCode.code}${this.model.phone}`;

    if (this.isEditMode && this.leadId) {
      this.leadsService.update(this.leadId, submissionModel).subscribe({
        next: () => {
          this.toastr.success('Lead updated successfully');
          this.router.navigate(['/leads']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error?.error || 'Failed to update lead');
        }
      });
      return;
    }

    this.leadsService.create(submissionModel).subscribe({
      next: () => {
        this.toastr.success('Lead created successfully');
        this.router.navigate(['/leads']);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.error || 'Failed to create lead');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/leads']);
  }
}
