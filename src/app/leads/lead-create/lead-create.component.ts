import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { LeadsService } from '../../services/leads.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-lead-create',
  templateUrl: './lead-create.component.html',
  styleUrls: ['./lead-create.component.css'],
})
export class LeadCreateComponent implements OnInit {

  isEditMode = false;
  isAdmin: boolean = false;
  isManager: boolean = false;
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
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };
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
    private toastr: ToastrService,
    private authService: AuthService

  ) { }

  ngOnInit(): void {

    this.isAdmin = this.authService.isAdmin();
    this.isManager = this.authService.isManager();

    // Auto assign lead to sales executive
    if (!this.isAdmin && !this.isManager) {
      this.model.assignedTo = this.authService.getUserId() || '';
    }

    // Edit mode check
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.breadcrumbItems = [
        { label: 'Leads', routerLink: '/leads' },
        { label: 'Lead Details', routerLink: ['/leads/details', this.leadId] },
        { label: 'Edit Lead' }
      ];
      this.loadLead(this.leadId);
    } else {
      this.breadcrumbItems = [
        { label: 'Leads', routerLink: '/leads' },
        { label: 'Create Lead' }
      ];
    }

    // Load employees only for Admin / Manager
    if (this.isAdmin || this.isManager) {
      this.leadsService.getEmployees('SALES_EXEC').subscribe({
        next: (emps) => this.employees = emps,
        error: () => this.toastr.error('Failed to load employees')
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

    loadLead(id: string) {
      this.leadsService.getById(id).subscribe({
        next: (lead) => {
          this.model = lead;

          // Bind dropdowns to IDs (not names) so mat-select can match them
          if (lead.projectId) { this.model.project = lead.projectId; }
          if (lead.sourceId) { this.model.source = lead.sourceId; }
          if (lead.statusId) { this.model.status = lead.statusId; }
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