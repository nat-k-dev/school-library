import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';
import { JoinError, SchoolService } from '../../core/school.service';
import { T } from '../../shared/nl';

/** Shown inside the shell when the signed-in user belongs to no school yet. */
@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f4f7fb] flex flex-col items-center px-5 py-10 gap-6">
      <div class="flex items-center gap-2">
        <img src="/assets/images/logo4.png" alt="" class="h-10 w-10 rounded-xl">
        <span class="text-lg font-semibold">{{ t.appName }}</span>
      </div>
      <div class="max-w-md text-center">
        <h1 class="screen-title">{{ t.onboarding.title }}</h1>
        <p class="text-slate-600">{{ t.onboarding.intro }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <form class="card flex flex-col gap-3" (ngSubmit)="create()">
          <h2 class="m-0 text-lg font-semibold">{{ t.onboarding.createTitle }}</h2>
          <mat-form-field class="input-field">
            <mat-label>{{ t.onboarding.schoolName }}</mat-label>
            <input matInput [formControl]="schoolName" autocomplete="organization">
            <mat-error>{{ t.fields.required }}</mat-error>
          </mat-form-field>
          <button mat-flat-button type="submit" class="primary-button" [disabled]="busy()">{{ t.onboarding.createButton }}</button>
        </form>

        <form class="card flex flex-col gap-3" (ngSubmit)="join()">
          <h2 class="m-0 text-lg font-semibold">{{ t.onboarding.joinTitle }}</h2>
          <p class="m-0 text-sm text-slate-600">{{ t.onboarding.joinText }}</p>
          <mat-form-field class="input-field">
            <mat-label>{{ t.onboarding.joinCode }}</mat-label>
            <input matInput [formControl]="joinCode" autocomplete="off" class="uppercase tracking-widest">
            <mat-error>{{ t.fields.required }}</mat-error>
          </mat-form-field>
          <button mat-stroked-button type="submit" class="primary-button" [disabled]="busy()">{{ t.onboarding.joinButton }}</button>
        </form>
      </div>

      @if (error(); as message) {
        <p class="m-0 text-red-700" role="alert">{{ message }}</p>
      }
      <button mat-button type="button" (click)="auth.logout()">{{ t.nav.logout }}</button>
    </div>
  `,
})
export class OnboardingComponent {
  protected readonly auth = inject(AuthService);
  private readonly school = inject(SchoolService);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly schoolName = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly joinCode = new FormControl('', { nonNullable: true, validators: Validators.required });

  protected async create(): Promise<void> {
    if (this.schoolName.invalid) {
      this.schoolName.markAsTouched();
      return;
    }
    await this.run(() => this.school.createSchool(this.schoolName.value));
  }

  protected async join(): Promise<void> {
    if (this.joinCode.invalid) {
      this.joinCode.markAsTouched();
      return;
    }
    await this.run(() => this.school.joinSchool(this.joinCode.value));
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (err) {
      this.error.set(this.describe(err));
    } finally {
      this.busy.set(false);
    }
  }

  private describe(err: unknown): string {
    if (err instanceof JoinError) {
      return err.code === 'unknown-code' ? T.onboarding.unknownCode : T.onboarding.alreadyMember;
    }
    return T.onboarding.failed;
  }
}
