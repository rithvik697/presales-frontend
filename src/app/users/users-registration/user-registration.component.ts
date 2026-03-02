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
  breadcrumbItems: MenuItem[];
  home: MenuItem;

  isEditMode: boolean = false;
  employeeId!: string;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex = /^\d{10}$/;

  user = {
    emp_id: '',
    emp_first_name: '',
    emp_middle_name: '',
    emp_last_name: '',
    role_id: '',
    emp_status: 'Active',
    phone_num: '',
    email: ''
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = params['id'];

        this.breadcrumbItems = [
          { label: 'Users', routerLink: '/users' },
          { label: 'Edit User' }
        ];

        this.loadUserForEdit();
      }
    });
  }

  loadUserForEdit(): void {
    this.http.get<any>(`http://127.0.0.1:5000/api/users/${this.employeeId}`).subscribe({
      next: (res) => {
        const data = res?.data ?? res;

        this.user = {
          emp_id: data.emp_id || '',
          emp_first_name: data.emp_first_name || '',
          emp_middle_name: data.emp_middle_name || '',
          emp_last_name: data.emp_last_name || '',
          role_id: data.role_id || '',
          emp_status: data.emp_status || 'Active',
          phone_num: data.phone_num || '',
          email: data.email || ''
        };
      },
      error: () => {
        this.toastr.error('Failed to load user details');
        this.router.navigate(['/users']);
      }
    });
  }

  submit(): void {
    this.user.emp_first_name = this.user.emp_first_name.trim();
    this.user.emp_middle_name = (this.user.emp_middle_name || '').trim();
    this.user.emp_last_name = this.user.emp_last_name.trim();
    this.user.phone_num = this.user.phone_num.trim();
    this.user.email = this.user.email.trim().toLowerCase();

    if (!this.user.emp_first_name || !this.user.emp_last_name || !this.user.role_id || !this.user.emp_status) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    if (!this.phoneRegex.test(this.user.phone_num)) {
      this.toastr.warning('Phone number must be exactly 10 digits');
      return;
    }

    if (!this.emailRegex.test(this.user.email)) {
      this.toastr.warning('Please enter a valid email address');
      return;
    }

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:5000/api/users/${this.employeeId}`, this.user).subscribe({
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
      this.http.post('http://127.0.0.1:5000/api/users/register', this.user).subscribe({
        next: (res: any) => {
          const assignedEmpId = res?.data?.emp_id;
          if (assignedEmpId) {
            this.toastr.success(`User created successfully. Employee ID: ${assignedEmpId}`);
          } else {
            this.toastr.success('User created successfully');
          }
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.error || 'Failed to create user');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
