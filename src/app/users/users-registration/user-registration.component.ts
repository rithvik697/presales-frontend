import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit {

  // 🔹 Breadcrumb
  breadcrumbItems: MenuItem[];
  home: MenuItem;

  // 🔹 Edit mode flag
  isEditMode: boolean = false;        // 🔧 explicit type (safe)
  employeeId!: string;

  // 🔹 Form model
  user = {
    emp_id: '',
    emp_first_name: '',
    emp_middle_name: '',
    emp_last_name: '',
    role_id: '',
    emp_status: 'Active'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    this.breadcrumbItems = [
      { label: 'Users', routerLink: '/users' },
      { label: 'Register User' }
    ];
  }

  // 🔹 Init
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];

        // 🔧 CHANGE: update breadcrumb defensively
        this.breadcrumbItems = [
          { label: 'Users', routerLink: '/users' },
          { label: 'Edit User' }
        ];

        this.loadUserForEdit();
      }
    });
  }

  // 🔹 Load user details for edit
  loadUserForEdit(): void {
    this.http.get<any>(
      `http://127.0.0.1:5000/api/users/${this.employeeId}`
    ).subscribe({
      next: (res) => {

        // 🔧 CHANGE: support BOTH backend response shapes
        const data = res?.data ?? res;

        this.user = {
          emp_id: data.emp_id,
          emp_first_name: data.emp_first_name,
          emp_middle_name: data.emp_middle_name,
          emp_last_name: data.emp_last_name,
          role_id: data.role_id,
          emp_status: data.emp_status
        };
      },
      error: () => {
        this.toastr.error('Failed to load user details');
        this.router.navigate(['/users']);
      }
    });
  }

  // 🔹 Submit form (CREATE or UPDATE)
  submit(): void {
    if (
      !this.user.emp_id ||
      !this.user.emp_first_name ||
      !this.user.emp_last_name ||
      !this.user.role_id
    ) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (this.isEditMode) {
      // ✅ UPDATE
      this.http.put(
        `http://127.0.0.1:5000/api/users/${this.employeeId}`,
        this.user
      ).subscribe({
        next: () => {
          this.toastr.success('User updated successfully');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.error || 'Failed to update user');
        }
      });

    } else {
      // ✅ CREATE
      this.http.post(
        'http://127.0.0.1:5000/api/users/register',
        this.user
      ).subscribe({
        next: () => {
          this.toastr.success('User created successfully');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.error || 'Failed to create user');
        }
      });
    }
  }

  // 🔹 Cancel button
  cancel(): void {
    this.router.navigate(['/users']);
  }

  // 🔹 Back arrow button
  goBack(): void {
    this.router.navigate(['/users']);
  }
}
