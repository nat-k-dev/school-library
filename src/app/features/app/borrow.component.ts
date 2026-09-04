import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { SchoolService } from '../../core/school.service';
import { LibraryError, LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { StudentsService } from '../../services/students.service';
import { Student, Title, studentDisplayName } from '../../shared/models';
import { T, formatDate } from '../../shared/nl';
import { IsbnInputComponent } from './isbn-input.component';

@Component({
  selector: 'app-borrow',
  imports: [
    IsbnInputComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './borrow.component.html',
})
export class BorrowComponent {
  private readonly library = inject(LibraryService);
  private readonly students = inject(StudentsService);
  private readonly school = inject(SchoolService);
  private readonly snackBar = inject(SnackBarService);

  protected readonly t = T;
  protected readonly name = studentDisplayName;
  protected readonly busy = signal(false);
  protected readonly isbn = signal<string | null>(null);
  /** `undefined` while looking up; `null` when the school does not own the book. */
  protected readonly title = signal<Title | null | undefined>(undefined);
  protected readonly available = signal(0);

  protected readonly groups = computed(() => this.school.school()?.groups ?? []);
  /** Remembered between loans: a leesouder usually works through one class. */
  protected readonly group = signal<string>('');
  protected readonly search = signal('');
  protected readonly candidates = computed(() => {
    const group = this.group();
    const needle = this.search().trim().toLowerCase();
    return this.students
      .activeStudents()
      .filter((s) => !group || s.group === group)
      .filter((s) => !needle || studentDisplayName(s).toLowerCase().includes(needle));
  });
  protected readonly studentsLoaded = computed(() => this.students.students() !== undefined);

  protected async onIsbn(isbn: string): Promise<void> {
    this.isbn.set(isbn);
    this.title.set(undefined);
    this.search.set('');
    try {
      const [title, counts] = await Promise.all([this.library.getTitle(isbn), this.library.countCopies(isbn)]);
      this.title.set(title);
      this.available.set(counts.available);
    } catch {
      this.snackBar.error(T.common.genericError);
      this.reset();
    }
  }

  protected async choose(student: Student): Promise<void> {
    const isbn = this.isbn();
    if (!isbn || this.busy()) return;
    this.busy.set(true);
    try {
      const loan = await this.library.borrow(isbn, student);
      this.snackBar.success(T.borrow.done(loan.title, loan.studentName, formatDate(loan.dueAt)));
      this.reset();
    } catch (err) {
      this.snackBar.error(err instanceof LibraryError && err.code === 'no-copy-available' ? T.borrow.noCopy : T.borrow.failed);
      if (err instanceof LibraryError) this.available.set(0);
    } finally {
      this.busy.set(false);
    }
  }

  protected reset(): void {
    this.isbn.set(null);
    this.title.set(undefined);
    this.available.set(0);
    // The ISBN input is re-created by the template once isbn() is null, so it starts empty.
  }
}
