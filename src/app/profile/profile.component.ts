import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  username: string | null = null;
  fullName: string | null = null;
  role: string | null = null;
  email: string | null = null;

  oldPassword: string = '';
  newPassword: string = '';

  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    // Load user info from localStorage
    this.username = localStorage.getItem('username');
    this.fullName = localStorage.getItem('fullName');
    this.role = localStorage.getItem('role');
    this.email = localStorage.getItem('email');

  }

  changePassword(): void {

    if (!this.oldPassword || !this.newPassword) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastr.warning('Password must be at least 6 characters');
      return;
    }

    const payload = {
      old_password: this.oldPassword,
      new_password: this.newPassword
    };

    this.loading = true;

    this.authService.changePassword(payload).subscribe({

      next: (res) => {

        this.loading = false;

        this.toastr.success('Password updated successfully');

        // reset fields
        this.oldPassword = '';
        this.newPassword = '';
      },

      error: (err) => {

        this.loading = false;

        if (err?.error?.message) {
          this.toastr.error(err.error.message);
        } else {
          this.toastr.error('Failed to update password');
        }

      }

    });

  }

}