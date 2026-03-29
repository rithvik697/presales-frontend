import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  confirmPassword: string = '';

  get pwChecks() {
    const p = this.newPassword;
    return {
      length:    p.length >= 8 && p.length <= 64,
      upper:     /[A-Z]/.test(p),
      lower:     /[a-z]/.test(p),
      number:    /[0-9]/.test(p),
      special:   /[@$!%*?&#^()_\-+=]/.test(p)
    };
  }

  get pwStrong(): boolean {
    const c = this.pwChecks;
    return c.length && c.upper && c.lower && c.number && c.special;
  }

  loading: boolean = false;
  forceChange: boolean = false;
  activeTabIndex: number = 0;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Load user info from localStorage
    this.username = localStorage.getItem('username');
    this.fullName = localStorage.getItem('fullName');
    this.role = localStorage.getItem('role');
    this.email = localStorage.getItem('email');

    // Check if forced password change
    this.forceChange = this.route.snapshot.queryParamMap.get('forceChange') === 'true'
      || localStorage.getItem('mustChangePassword') === 'true';

    if (this.forceChange) {
      this.activeTabIndex = 1; // Auto-select Security tab
    }

  }

  changePassword(): void {

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this.toastr.warning('New password must be different from the current password');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.warning('Passwords do not match');
      return;
    }

    if (!this.pwStrong) {
      this.toastr.warning('Password must be 8-64 chars with uppercase, lowercase, number, and special character');
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
        this.confirmPassword = '';

        // If forced password change, clear flag and redirect
        if (this.forceChange) {
          this.forceChange = false;
          localStorage.removeItem('mustChangePassword');
          this.router.navigate(['/dashboard']);
        }
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
