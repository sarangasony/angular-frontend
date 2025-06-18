import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ensure this path is correct

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Optional: for loading indicator

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule // Add this to imports for loading indicator
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], // Or `styles` property if embedded
})
export class LoginComponent {
  form;
  loginError: string | null = null; // Property to store error message
  isLoading = false; // Property for loading indicator

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Added Validators.email for better validation
      password: ['', [Validators.required, Validators.minLength(6)]], // Added minLength for password
    });
  }

  onSubmit() {
    this.loginError = null; // Clear previous errors
    this.isLoading = true;  // Show loading indicator

    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors immediately
      this.form.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    this.auth.login(this.form.value).subscribe({
      next: (response: { token: string }) => { 
        this.isLoading = false;
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          console.log('Login successful! Token saved.');
          this.router.navigate(['/dashboard']); // Navigate to the dashboard or home page
        } else {
          this.loginError = 'Login failed: No token received.';
        }
      },
      error: (errorRes) => {
        this.isLoading = false;
        console.error('Login error:', errorRes);
        // Handle different types of errors from your backend
        if (errorRes.error && errorRes.error.message) {
          this.loginError = errorRes.error.message; // Backend sent a specific message
        } else if (errorRes.status === 401) {
          this.loginError = 'Invalid credentials. Please check your email and password.';
        } else {
          this.loginError = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }
}