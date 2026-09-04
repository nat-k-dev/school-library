import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';
import { JoinError, SchoolService } from '../../core/school.service';
import { LibraryService } from '../../services/library.service';
import { StudentsService } from '../../services/students.service';
import { DEMO_STUDENTS, DEMO_TITLES } from '../../shared/demo-data';
import { T } from '../../shared/nl';

/** Shown inside the shell when the signed-in user belongs to no school yet. */
@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
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
        <!-- [formGroup] is what turns (ngSubmit) on; without it the browser does a native submit and reloads. -->
        <form class="card flex flex-col gap-3" [formGroup]="createForm" (ngSubmit)="create()">
          <h2 class="m-0 text-lg font-semibold">{{ t.onboarding.createTitle }}</h2>
          <mat-form-field class="input-field">
            <mat-label>{{ t.onboarding.schoolName }}</mat-label>
            <input matInput formControlName="name" autocomplete="organization">
            <mat-error>{{ t.fields.required }}</mat-error>
          </mat-form-field>
          <mat-checkbox formControlName="demo" class="text-sm">{{ t.onboarding.demoData }}</mat-checkbox>
          <button mat-flat-button type="submit" class="primary-button" [disabled]="busy()">{{ t.onboarding.createButton }}</button>
        </form>

        <form class="card flex flex-col gap-3" [formGroup]="joinForm" (ngSubmit)="join()">
          <h2 class="m-0 text-lg font-semibold">{{ t.onboarding.joinTitle }}</h2>
          <p class="m-0 text-sm text-slate-600">{{ t.onboarding.joinText }}</p>
          <mat-form-field class="input-field">
            <mat-label>{{ t.onboarding.joinCode }}</mat-label>
            <input matInput formControlName="code" autocomplete="off" class="uppercase tracking-widest">
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
  private readonly students = inject(StudentsService);
  private readonly library = inject(LibraryService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly createForm = this.fb.group({
    name: ['', Validators.required],
    demo: [false],
  });
  protected readonly joinForm = this.fb.group({
    code: ['', Validators.required],
  });

  protected async create(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const { name, demo } = this.createForm.getRawValue();
    await this.run(async () => {
      await this.school.createSchool(name);
      if (demo) await this.seedDemo();
    });
  }

  protected async join(): Promise<void> {
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      return;
    }
    await this.run(() => this.school.joinSchool(this.joinForm.getRawValue().code));
  }

  /** The school document arrives through a listener; wait for it before writing under it. */
  private async seedDemo(): Promise<void> {
    for (let i = 0; i < 50 && !this.school.schoolId(); i++) await new Promise((r) => setTimeout(r, 100));
    await this.students.importMany(DEMO_STUDENTS);
    for (const { isbn, draft, copies } of DEMO_TITLES) await this.library.addTitleWithCopies(isbn, draft, copies);
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
