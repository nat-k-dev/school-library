import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WelcomeComponent } from '../welcome/welcome.component';
import type { Context } from "@netlify/edge-functions";

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    WelcomeComponent,
  ],
  template: `
    <app-welcome class="mt-4 md:mt-12 px-4 flex justify-center" /> 
    <mat-card class="auth-card">
      <h2>Login</h2>
      <form #loginForm="ngForm" (ngSubmit)="login(loginForm)">
        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput type="email" name="email" [(ngModel)]="emailLogin" required email />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Password</mat-label>
          <input matInput type="password" name="password" [(ngModel)]="passwordLogin" required minlength="6" />
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">Login</button>
      </form>
    </mat-card>
  `,
  styles: [`
    .auth-card {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: transparent !important;
      box-shadow: none !important;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .my-divider {
      margin: 24px 0;
    }
  `]
})
export class LoginComponent {
  emailLogin = '';
  passwordLogin = '';

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {
    const value = Netlify.env.get("NG_APP_FIREBASE_API_KEY");
    console.log('Netlify.env.get("NG_APP_FIREBASE_API_KEY")=', value)
  }

  login(form: NgForm) {
    if (form.invalid) return;

    this.authService.login(this.emailLogin, this.passwordLogin)
      .then(() => {
        this.showMessage('✅ Logged in successfully!');
        setTimeout(() => this.router.navigateByUrl(''));
      })
      .catch(err => this.showMessage(`❌ Login failed: ${err.message}`));
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      verticalPosition: 'top',
    });
  }
}
