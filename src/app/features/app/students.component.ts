import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { SchoolService } from '../../core/school.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { StudentsService } from '../../services/students.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { parseStudentCsv } from '../../shared/csv';
import { Student, studentDisplayName } from '../../shared/models';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-students',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students.component.html',
})
export class StudentsComponent {
  private readonly students = inject(StudentsService);
  private readonly school = inject(SchoolService);
  private readonly snackBar = inject(SnackBarService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly name = studentDisplayName;
  protected readonly groups = computed(() => this.school.school()?.groups ?? []);
  protected readonly loaded = computed(() => this.students.students() !== undefined);
  protected readonly busy = signal(false);
  protected readonly panel = signal<'none' | 'add' | 'import'>('none');

  /** Active students grouped in the school's group order; unknown groups last. */
  protected readonly byGroup = computed(() => {
    const order = this.groups();
    const map = new Map<string, Student[]>();
    for (const s of this.students.activeStudents()) map.set(s.group, [...(map.get(s.group) ?? []), s]);
    return [...map.entries()].sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b, 'nl', { numeric: true });
    });
  });

  protected readonly addForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    group: ['', Validators.required],
  });

  protected readonly importText = signal('');
  protected readonly importRows = computed(() => parseStudentCsv(this.importText()));

  protected async add(): Promise<void> {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const value = this.addForm.getRawValue();
    await this.run(async () => {
      await this.students.add(value);
      this.snackBar.success(T.students.added(studentDisplayName(value)));
      this.addForm.reset({ group: value.group });
    });
  }

  protected async onFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.importText.set(await file.text());
  }

  protected async runImport(): Promise<void> {
    const rows = this.importRows();
    if (rows.length === 0) return;
    await this.run(async () => {
      const added = await this.students.importMany(rows);
      this.snackBar.success(added > 0 ? T.students.imported(added) : T.students.importedNone);
      this.importText.set('');
      this.panel.set('none');
    });
  }

  protected async deactivate(student: Student): Promise<void> {
    await this.run(() => this.students.update(student.id, { active: false }));
  }

  protected async remove(student: Student): Promise<void> {
    const data: ConfirmDialogData = {
      message: T.students.confirmRemove(studentDisplayName(student)),
      confirmLabel: T.students.remove,
      cancelLabel: T.common.cancel,
    };
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, { data });
    if ((await firstValueFrom(ref.afterClosed())) !== true) return;
    await this.run(() => this.students.remove(student.id));
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch {
      this.snackBar.error(T.students.failed);
    } finally {
      this.busy.set(false);
    }
  }
}
