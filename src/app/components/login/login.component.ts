import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <input matInput formControlName="email" placeholder="Email" />
      </mat-form-field>
      <mat-form-field>
        <input matInput formControlName="password" placeholder="Password" type="password" />
      </mat-form-field>
      <button mat-raised-button type="submit">Login</button>
    </form>
  `,
})
export class LoginComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.auth.login(this.form.value).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
