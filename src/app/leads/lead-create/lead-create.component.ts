import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { LeadsService } from '../../services/leads.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lead-create',
  templateUrl: './lead-create.component.html',
  styleUrls: ['./lead-create.component.css'],
})
export class LeadCreateComponent implements OnInit {

  isEditMode = false;
  isAdmin: boolean = false;
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
  countryCodes = [
    { code: '+91', flag: '🇮🇳', limit: 10 },
    { code: '+1', flag: '🇺🇸', limit: 10 },
    { code: '+44', flag: '🇬🇧', limit: 10 },
    { code: '+61', flag: '🇦🇺', limit: 9 },
    { code: '+86', flag: '🇨🇳', limit: 11 }
  ];

  selectedCountryCode = this.countryCodes[0];

  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = payload.role_type === 'ADMIN';
    }
    // Edit mode check
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.loadLead(this.leadId);
    }

    // Load employees
    this.leadsService.getEmployees().subscribe({
      next: (emps) => this.employees = emps,
      error: () => this.toastr.error('Failed to load employees')
    });

    // 🔥 Load projects dynamically
    this.leadsService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: () => this.toastr.error('Failed to load projects')
    });
    // 🔥 Load Sources
    this.leadsService.getSources().subscribe({
      next: (data) => this.sources = data,
      error: () => this.toastr.error('Failed to load sources')
    });

    // 🔥 Load Statuses
    this.leadsService.getStatuses().subscribe({
      next: (data) => {
        console.log('Statuses from API:', data);  // 👈 ADD THIS
        this.statuses = data;
      },
      error: (err) => {
        console.error('Status API error:', err);
        this.toastr.error('Failed to load statuses');
      }
    });
  }

  loadLead(id: string) {
  this.leadsService.getById(id).subscribe({
      next: (lead) => {
        this.model = lead;

        // Bind dropdowns to IDs (not names) so mat-select can match them
      if (lead.projectId)    { this.model.project    = lead.projectId; }
      if (lead.sourceId)     { this.model.source     = lead.sourceId; }
      if (lead.statusId)     { this.model.status     = lead.statusId; }
      if (lead.assignedToId) { this.model.assignedTo = lead.assignedToId; }

        // Parse full name into first/last
        if (lead.name) {
        const parts = lead.name.split(' ');
        this.model.firstName = parts[0] || '';
        this.model.lastName = parts.slice(1).join(' ') || '';
        }

        // Extract country code from phone
        if (this.model.phone) {
          const found = this.countryCodes
            .sort((a, b) => b.code.length - a.code.length)
            .find(c => this.model.phone.startsWith(c.code));

        if (found) {
            this.selectedCountryCode = found;
            this.model.phone = this.model.phone.replace(found.code, '').trim();
        }
      }
    },
      error: () => this.toastr.error('Failed to load lead')
    });
  }

  onPhoneInput(event: any, isMain: boolean) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');

    const limit = this.selectedCountryCode.limit;
    if (val.length > limit) {
      val = val.slice(0, limit);
    }

    if (isMain) {
      this.model.phone = val;
    } else {
      this.model.alternatePhone = val;
    }

    input.value = val;
  }

  submit() {

    if (!this.model.phone) {
      this.toastr.error('Phone number is required');
      return;
    }

    if (this.model.phone.length !== this.selectedCountryCode.limit) {
      this.toastr.error(
        `Phone number must be exactly ${this.selectedCountryCode.limit} digits`
      );
      return;
    }

    // Construct full name
    this.model.name =
      `${this.model.firstName} ${this.model.lastName}`.trim();

    const submissionModel: any = { ...this.model };

    submissionModel.phone =
      `${this.selectedCountryCode.code} ${this.model.phone}`;

    if (this.isEditMode && this.leadId) {
      // actorId is NOT sent — the backend reads it from the JWT token
      this.leadsService.update(this.leadId, submissionModel)
        .subscribe({
          next: () => {
            this.toastr.success('Lead updated successfully');
            this.router.navigate(['/leads']);
          },
          error: (err) => {
            console.error(err);
            this.toastr.error(err.error?.error || 'Failed to update lead');
          }
        });

    } else {
      // actorId is NOT sent — the backend reads it from the JWT token
      this.leadsService.create(submissionModel)
        .subscribe({
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
  }

  cancel() {
    this.router.navigate(['/leads']);
  }
}