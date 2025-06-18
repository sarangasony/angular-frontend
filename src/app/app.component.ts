import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
 imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  // template: `<router-outlet></router-outlet>`,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Task Manager';

  constructor(
    public authService: AuthService, // Made public to use in template
    private router: Router
  ) {}

  /**
   * Checks if the user is currently logged in.
   * This property is used to conditionally display elements in the navigation bar.
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Logs out the user and redirects to the login page.
   * Calls the logout method from AuthService and navigates away.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
