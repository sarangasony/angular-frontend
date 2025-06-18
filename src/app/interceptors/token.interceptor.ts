import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'; 
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { catchError, throwError } from 'rxjs'; 

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); 
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const token = localStorage.getItem('token');
  console.log('TokenInterceptor: Checking for token in localStorage. Found:', !!token);

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;

  console.log('TokenInterceptor: Request URL:', authReq.url);
  if (token) {
    console.log('TokenInterceptor: Authorization header added:', authReq.headers.get('Authorization'));
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('TokenInterceptor: 401 Unauthorized - Session expired or invalid token.');
        authService.logout(); // Clear the token
        router.navigate(['/login']); // Redirect to login page
        snackBar.open('Your session has expired. Please log in again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
      return throwError(() => error); // Re-throw the error for other handlers
    })
  );
};