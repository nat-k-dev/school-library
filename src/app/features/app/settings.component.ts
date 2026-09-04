import { ChangeDetectionStrategy, Component, NgZone, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { firstValueFrom, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { collectionChanges } from '../../core/firestore.util';
import { SchoolService } from '../../core/school.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { StudentsService } from '../../services/students.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Member } from '../../shared/models';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthService);
  private readonly students = inject(StudentsService);
  private readonly snackBar = inject(SnackBarService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly school = inject(SchoolService);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly plan = computed(() => T.settings.plan[this.school.school()?.plan ?? 'free']);

  protected readonly members = toSignal(
    toObservable(this.school.schoolId).pipe(
      switchMap((id) => (id ? collectionChanges<Member>(this.zone, this.school.schoolCollection('members'), 'uid') : of([]))),
    ),
    { initialValue: [] as Member[] },
  );

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    loanDays: [21, [Validators.required, Validators.min(1)]],
    groups: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const school = this.school.school();
      if (school && this.form.pristine) {
        this.form.reset({ name: school.name, loanDays: school.loanDays, groups: school.groups.join(', ') });
      }
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const groups = value.groups
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    await this.run(async () => {
      await this.school.updateSchool({ name: value.name.trim(), loanDays: Number(value.loanDays), groups });
      this.form.markAsPristine();
      this.snackBar.success(T.settings.saved);
    });
  }

  protected async copyCode(): Promise<void> {
    const code = this.school.school()?.joinCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.snackBar.success(T.settings.copied);
    } catch {
      /* clipboard unavailable: the code is visible on screen anyway */
    }
  }

  protected async newYear(): Promise<void> {
    const data: ConfirmDialogData = {
      message: T.settings.newYearConfirm,
      confirmLabel: T.settings.newYearButton,
      cancelLabel: T.common.cancel,
    };
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, { data });
    if ((await firstValueFrom(ref.afterClosed())) !== true) return;
    await this.run(async () => {
      const result = await this.students.promoteAll(this.school.school()?.groups ?? []);
      this.snackBar.success(T.settings.newYearDone(result.promoted, result.left));
    });
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch {
      this.snackBar.error(T.common.genericError);
    } finally {
      this.busy.set(false);
    }
  }
}
