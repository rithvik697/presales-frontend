import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { RegistrationService } from 'app/services/registration.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit {

  isEditMode: boolean = false;
  employeeId!: string;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex = /^\d{10}$/;
  private readonly usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // letters, numbers, underscore (min 3)

  user = {
    emp_id: '',
    emp_first_name: '',
    emp_middle_name: '',
    emp_last_name: '',
    role_id: '',
    emp_status: 'Active',
    phone_num: '',
    email: '',
    username: ''   // ✅ ADDED
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private regService: RegistrationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];
        this.loadUserForEdit();
      }
    });
  }

  // ================= LOAD USER =================
  loadUserForEdit(): void {
    this.regService.getUserById(this.employeeId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;

        this.user = {
          emp_id: data.emp_id || '',
          emp_first_name: data.emp_first_name || '',
          emp_middle_name: data.emp_middle_name || '',
          emp_last_name: data.emp_last_name || '',
          role_id: data.role_id || '',
          emp_status: data.emp_status || 'Active',
          phone_num: data.phone_num || '',
          email: data.email || '',
          username: data.username || ''  // ✅ ADDED
        };
      },
      error: () => {
        this.toastr.error('Failed to load user details');
        this.router.navigate(['/users']);
      }
    });
  }

  // ================= SUBMIT =================
  submit(): void {

    // Trim inputs
    this.user.emp_first_name = this.user.emp_first_name.trim();
    this.user.emp_middle_name = (this.user.emp_middle_name || '').trim();
    this.user.emp_last_name = this.user.emp_last_name.trim();
    this.user.phone_num = this.user.phone_num.trim();
    this.user.email = this.user.email.trim().toLowerCase();
    this.user.username = this.user.username.trim();

    // Required field check
    if (
      !this.user.emp_first_name ||
      !this.user.emp_last_name ||
      !this.user.role_id ||
      !this.user.emp_status ||
      !this.user.username
    ) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    // Username validation
    if (!this.usernameRegex.test(this.user.username)) {
      this.toastr.warning('Username must be at least 3 characters and contain only letters, numbers or underscore');
      return;
    }

    // Phone validation
    if (!this.phoneRegex.test(this.user.phone_num)) {
      this.toastr.warning('Phone number must be exactly 10 digits');
      return;
    }

    // Email validation
    if (!this.emailRegex.test(this.user.email)) {
      this.toastr.warning('Please enter a valid email address');
      return;
    }

    // ================= UPDATE MODE =================
    if (this.isEditMode) {

      this.regService.updateUser(this.employeeId, this.user).subscribe({
        next: () => {
          this.toastr.success('User updated successfully');
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error(err);
          this.toastr.error(err?.error?.error || 'Failed to update user');
        }
      });

    } 
    // ================= CREATE MODE =================
    else {

      this.regService.registerUser(this.user).subscribe({
        next: (res: any) => {

          const assignedEmpId = res?.emp_id || res?.data?.emp_id;

          if (assignedEmpId) {
            this.toastr.success(`User created successfully. Employee ID: ${assignedEmpId}`);
          } else {
            this.toastr.success('User created successfully');
          }

          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          console.error(err);
          this.toastr.error(err?.error?.error || 'Failed to create user');
        }
      });

    }
  }

  // ================= DELETE =================
  confirmDelete() {
    this.confirmationService.confirm({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteUser();
      }
    });
  }

  deleteUser() {
    this.regService.deleteUser(this.employeeId).subscribe({
      next: () => {
        this.toastr.success('User deleted successfully');
        this.router.navigate(['/users']);
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Failed to delete user');
      }
    });
  }

  // ================= NAVIGATION =================
  cancel(): void {
    this.router.navigate(['/users']);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

}