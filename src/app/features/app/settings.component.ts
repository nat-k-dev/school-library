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
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { StudentsService } from '../../services/students.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { downloadCsv, toCsv } from '../../shared/export';
import { Member, studentDisplayName, today } from '../../shared/models';
import { T, formatDate } from '../../shared/nl';
import { FREE_TIER_COPIES } from '../../shared/plan';

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
  private readonly library = inject(LibraryService);
  private readonly snackBar = inject(SnackBarService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly school = inject(SchoolService);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly planName = computed(() => T.settings.planName[this.school.plan()?.status ?? 'free']);

  /** One sentence about where the subscription stands. */
  protected readonly planText = computed(() => {
    const plan = this.school.plan();
    const count = this.school.school()?.copyCount ?? 0;
    if (!plan) return '';
    switch (plan.status) {
      case 'trial':
        return T.plan.status.trial(plan.daysLeft ?? 0, formatDate(plan.until ?? ''));
      case 'paid':
        return T.plan.status.paid(formatDate(plan.until ?? ''));
      case 'free':
        return T.plan.status.free(count, FREE_TIER_COPIES);
      case 'locked':
        return T.plan.status.locked(count, FREE_TIER_COPIES);
    }
  });

  protected readonly requestHref = computed(() => {
    const school = this.school.school();
    if (!school) return '';
    const subject = encodeURIComponent(T.plan.requestSubject(school.name));
    const body = encodeURIComponent(T.plan.requestBody(school.name, school.copyCount));
    return `mailto:info@biebouders.nl?subject=${subject}&body=${body}`;
  });

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

  protected async exportBooks(): Promise<void> {
    await this.run(async () => {
      const titles = new Map((this.library.titles() ?? []).map((t) => [t.isbn, t]));
      const copies = (this.library.copies() ?? []).filter((c) => c.status !== 'removed');
      const csv = toCsv(copies, [
        { header: 'ISBN', value: (c) => c.isbn },
        { header: 'Titel', value: (c) => titles.get(c.isbn)?.title },
        { header: 'Auteur', value: (c) => titles.get(c.isbn)?.author },
        { header: 'AVI', value: (c) => titles.get(c.isbn)?.avi },
        { header: 'Locatie', value: (c) => c.location },
        { header: 'Status', value: (c) => T.books.copyStatus[c.status] },
        { header: 'Toegevoegd', value: (c) => c.createdAt.slice(0, 10) },
      ]);
      downloadCsv(`biebouders-boeken-${today()}.csv`, csv);
    });
  }

  protected async exportStudents(): Promise<void> {
    await this.run(async () => {
      const csv = toCsv(this.students.activeStudents(), [
        { header: 'Voornaam', value: (s) => s.firstName },
        { header: 'Achternaam', value: (s) => s.lastName },
        { header: 'Groep', value: (s) => s.group },
      ]);
      downloadCsv(`biebouders-leerlingen-${today()}.csv`, csv);
    });
  }

  protected async exportLoans(): Promise<void> {
    await this.run(async () => {
      const loans = await this.library.allLoans();
      const csv = toCsv(loans, [
        { header: 'Uitgeleend op', value: (l) => l.borrowedAt },
        { header: 'Terug op', value: (l) => l.dueAt },
        { header: 'Ingenomen op', value: (l) => l.returnedAt },
        { header: 'Titel', value: (l) => l.title },
        { header: 'ISBN', value: (l) => l.isbn },
        { header: 'Leerling', value: (l) => l.studentName },
        { header: 'Groep', value: (l) => l.group },
      ]);
      downloadCsv(`biebouders-uitleningen-${today()}.csv`, csv);
    });
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  protected readonly name = studentDisplayName;

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
