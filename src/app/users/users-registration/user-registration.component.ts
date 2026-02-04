import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent {

  // 🔹 Breadcrumb
  breadcrumbItems: MenuItem[];
  home: MenuItem;

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
    private toastr: ToastrService
  ) {
    // ✅ Breadcrumb setup
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

    this.breadcrumbItems = [
      { label: 'Users', routerLink: '/users' },
      { label: 'Register User' }
    ];
  }

  // 🔹 Submit form
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

    this.http.post(
      'http://127.0.0.1:5000/api/users/register',
      this.user
    ).subscribe({
      next: () => {
        this.toastr.success('User created successfully');
        this.router.navigate(['/users']); // ✅ back to list
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.error || 'Failed to create user');
      }
    });
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
