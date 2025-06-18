import { Component, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="register-container">
      <h2>Register Component</h2>
      <p>This is a placeholder for the registration form.</p>
      <p>Go back to <a routerLink="/login">Login</a></p>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f2f5;
      padding: 20px;
      box-sizing: border-box;
    }
  `
})
export class RegisterComponent implements OnInit { // Implement OnInit
  ngOnInit(): void {
    console.log('RegisterComponent initialized'); // Add console log
  }
}
