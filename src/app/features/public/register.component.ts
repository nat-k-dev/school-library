import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { T } from '../../shared/nl';
import { describeAuthError } from './auth-errors';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f4f7fb] text-[#14305c] flex flex-col items-center px-5 py-10">
      <a routerLink="/" class="flex items-center gap-2 no-underline text-[#14305c] mb-8">
        <img src="/assets/images/logo4.png" alt="" class="h-10 w-10 rounded-xl">
        <span class="text-lg font-semibold">{{ t.appName }}</span>
      </a>
      <form class="card w-full max-w-sm flex flex-col gap-3" [formGroup]="form" (ngSubmit)="submit()">
        <h1 class="screen-title mb-2">{{ t.auth.registerTitle }}</h1>

        <mat-form-field class="input-field">
          <mat-label>{{ t.auth.email }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email">
          <mat-error>{{ t.auth.errors.invalidEmail }}</mat-error>
        </mat-form-field>
        <mat-form-field class="input-field">
          <mat-label>{{ t.auth.password }}</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password">
          <mat-hint>{{ t.auth.passwordHint }}</mat-hint>
          <mat-error>{{ t.auth.errors.weakPassword }}</mat-error>
        </mat-form-field>

        @if (error(); as message) {
          <p class="m-0 text-sm text-red-700" role="alert">{{ message }}</p>
        }

        <button mat-flat-button type="submit" class="primary-button mt-2" [disabled]="busy()">{{ t.auth.registerButton }}</button>

        <div class="flex items-center gap-3 text-slate-400 text-sm my-1">
          <span class="grow border-t border-slate-200"></span>{{ t.auth.or }}<span class="grow border-t border-slate-200"></span>
        </div>
        <button mat-stroked-button type="button" (click)="google()" [disabled]="busy()">{{ t.auth.google }}</button>

        <p class="m-0 mt-3 text-sm text-center text-slate-600">
          {{ t.auth.hasAccount }} <a routerLink="/login" class="text-[#1f4e9c]">{{ t.auth.toLogin }}</a>
        </p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    await this.run(() => this.auth.register(email, password));
  }

  protected async google(): Promise<void> {
    await this.run(() => this.auth.loginWithGoogle());
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
      await this.router.navigateByUrl('/app');
    } catch (err) {
      this.error.set(describeAuthError(err));
    } finally {
      this.busy.set(false);
    }
  }
}
