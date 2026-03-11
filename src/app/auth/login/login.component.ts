import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  loginUser(): void {
  if (this.loginForm.invalid) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.login(this.loginForm.value).subscribe({
    next: (res) => {
      localStorage.setItem('token', res.access_token); // match guard
      localStorage.setItem('username', res.username);
      localStorage.setItem('fullName', res.full_name);
      localStorage.setItem('role', res.role_type);
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      this.errorMessage = 'Invalid credentials';
      this.isLoading = false;
    }
  });
}

}
