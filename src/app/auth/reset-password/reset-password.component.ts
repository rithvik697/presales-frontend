import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  token: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get passwordChecks() {
    const p = this.resetForm?.get('password')?.value || '';
    return {
      length: p.length >= 8 && p.length <= 64,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[@$!%*?&#^()_\-+=]/.test(p)
    };
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
       confirmPassword: ['', Validators.required]
    });

    // Get token from URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword(): void {

    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const password = this.resetForm.value.password;
    const confirmPassword = this.resetForm.value.confirmPassword;
    const checks = this.passwordChecks;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    if (!(checks.length && checks.upper && checks.lower && checks.number && checks.special)) {
      this.errorMessage = 'Password must be 8-64 chars and include uppercase, lowercase, number, and special character';
      this.isLoading = false;
      return;
    }

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.successMessage = 'Password reset successful. Redirecting to login...';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.errorMessage = 'Reset link is invalid or expired.';
        this.isLoading = false;
      }
    });
  }
}
