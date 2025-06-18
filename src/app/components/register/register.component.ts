import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // if you want to use routerLink/navigation here
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule, // Add MatProgressBarModule
    MatSnackBarModule, // Add MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  hidePassword = true;

  form;
  isLoading = false;
  registerError: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get name() {
    return this.form.get('name');
  }
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  onSubmit() {
    this.registerError = ''; // Clear previous errors
    this.isLoading = true; // Start loading

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isLoading = false; // Stop loading if form is invalid
      console.log('Register form is invalid.');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.error(`Validation error on control '${key}':`, control.errors);
        }
      });
      return;
    }

    // Call the register service
    this.authService.register(this.form.value).subscribe({
      next: (response) => {
        this.isLoading = false; // Stop loading
        console.log('Registration successful:', response);
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 3000,
        });
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirect to login page
        }, 100);
      },
      error: (errorRes) => {
        this.isLoading = false; // Stop loading
        console.error('Registration error:', errorRes);
        if (errorRes.error && errorRes.error.message) {
          this.registerError = errorRes.error.message;
        } else {
          this.registerError = 'An unexpected error occurred during registration. Please try again.';
        }
        this.snackBar.open(this.registerError, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'], // Optional: for custom styling of error snackbar
        });
      }
    });
  }
}
