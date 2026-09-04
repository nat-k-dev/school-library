import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BooksService, LibraryError } from '../../services/books.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { toIsbn13 } from '../../shared/isbn';
import { isbnValidator } from '../../shared/isbn-validator';
import { T } from '../../shared/nl';
import { ScannerComponent } from '../../shared/scanner/scanner.component';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-borrow-book',
  imports: [
    GoBackButtonComponent,
    ScannerComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './borrow-book.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BorrowBookComponent {
  private readonly books = inject(BooksService);
  private readonly snackBar = inject(SnackBarService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group({
    isbn: ['', [Validators.required, isbnValidator]],
    childName: ['', Validators.required],
    group: ['', Validators.required],
  });

  protected onScanned(isbn: string): void {
    this.form.controls.isbn.setValue(isbn);
    this.form.controls.isbn.markAsTouched();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    const { isbn, childName, group } = this.form.getRawValue();
    this.busy.set(true);
    try {
      const book = await this.books.borrowBook(toIsbn13(isbn)!, childName, group);
      this.snackBar.success(T.borrow.done(book.title, book.borrowedBy));
      // Keep the group: a leesouder usually lends to one class at a time.
      this.form.reset({ group });
    } catch (err) {
      this.snackBar.error(this.describe(err));
    } finally {
      this.busy.set(false);
    }
  }

  private describe(err: unknown): string {
    if (err instanceof LibraryError) {
      if (err.code === 'not-found') return T.common.notFound;
      if (err.code === 'already-borrowed') return T.borrow.alreadyBorrowed(err.book?.borrowedBy ?? '');
    }
    return T.borrow.failed;
  }
}
