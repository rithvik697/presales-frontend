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
    assignedTo: 'Admin', // Default
    status: 'New'      // Default
  };

  projects = ['Amity', 'Patio', 'Santorini'];
  sources = ['Google', 'Website', 'Walk-in'];
  // Employees for assignment - fetching dynamically ideally, or hardcoded for now, 
  // but better to fetch from service if we want it to match list. 
  // For now I'll use the same list as the list component or similar.
  // Ideally this should come from API.
  employees: string[] = [];

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
    // Check if Edit Mode
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.loadLead(this.leadId);
    }

    // Load employees for assignment dropdown
    this.leadsService.getEmployees().subscribe(emps => this.employees = emps);
  }

  loadLead(id: string) {
    this.leadsService.getById(id).subscribe({
      next: (lead) => {
        this.model = lead;
        // Parse Name: Assume "First [Middle] Last"
        if (lead.name) {
          const parts = lead.name.split(' ');
          if (parts.length > 2) {
            this.model.firstName = parts.shift();
            this.model.lastName = parts.pop();
            this.model.middleName = parts.join(' ');
          } else if (parts.length === 2) {
            this.model.firstName = parts[0];
            this.model.lastName = parts[1];
          } else {
            this.model.firstName = parts[0];
          }
        }

        // Extract Country Code from Phone if possible
        if (this.model.phone) {
          // Attempt to find if current phone starts with any known code
          // Reverse sort by length so we match +91 before +9 (if existed)
          const sortedCodes = [...this.countryCodes].sort((a, b) => b.code.length - a.code.length);
          const found = sortedCodes.find(c => this.model.phone.startsWith(c.code));

          if (found) {
            this.selectedCountryCode = found;
            // Remove code and spaces from display phone
            this.model.phone = this.model.phone.replace(found.code, '').trim();
          }
        }
      },
      error: (err) => this.toastr.error('Failed to load lead')
    });
  }

  onPhoneInput(event: any, isMain: boolean) {
    const input = event.target;
    // Remove non-numeric
    let val = input.value.replace(/[^0-9]/g, '');

    // Enforce Limit for both
    // User requested "set limit to the alternate number too"
    // We use the selected country limit for both for consistency
    const limit = this.selectedCountryCode ? this.selectedCountryCode.limit : 15;
    if (val.length > limit) {
      val = val.slice(0, limit);
    }


    // Update model manually
    if (isMain) {
      this.model.phone = val;
    } else {
      this.model.alternatePhone = val;
    }

    input.value = val; // Force update input view
  }

  submit() {
    // 1. Phone Validation
    if (!this.model.phone) {
      this.toastr.error('Phone number is required');
      return;
    }

    // Check length strictly
    if (this.model.phone.length !== this.selectedCountryCode.limit) {
      this.toastr.error(`Phone number must be exactly ${this.selectedCountryCode.limit} digits for ${this.selectedCountryCode.flag}`);
      return;
    }

    // 2. Construct Full Name
    const middle = this.model.middleName ? ` ${this.model.middleName} ` : ' ';
    this.model.name = `${this.model.firstName}${middle}${this.model.lastName || ''}`.replace(/\s+/g, ' ').trim();

    // 3. Prepend Country Code logic
    const submissionModel = { ...this.model };

    // In Edit Mode: We usually don't update phone? 
    // But if we did, we would need to prepend. 
    // However, the requirement says "phone number that has +91 in it instead of outside... causing user unable to update other details".
    // So we stripped it for display. Now we must put it back for backend storage IF we are ostensibly "updating" the lead object completely.
    // Even if read-only, we should send back the full format.
    submissionModel.phone = `${this.selectedCountryCode.code} ${this.model.phone}`;


    if (this.isEditMode && this.leadId) {
      this.leadsService.update(this.leadId, submissionModel).subscribe({
        next: () => {
          this.toastr.success('Lead updated successfully');
          this.router.navigate(['/leads']);
        },
        error: (err) => this.toastr.error('Failed to update lead')
      });
    } else {
      this.leadsService.create(submissionModel).subscribe({
        next: () => {
          this.toastr.success('Lead created successfully');
          this.router.navigate(['/leads']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to create lead');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/leads']);
  }
}
