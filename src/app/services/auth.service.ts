import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any): Observable<{ token: string }>  {
    return this.http.post<{ token: string }>(`${this.api}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
