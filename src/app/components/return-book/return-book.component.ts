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
  selector: 'app-return-book',
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
  templateUrl: './return-book.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnBookComponent {
  private readonly books = inject(BooksService);
  private readonly snackBar = inject(SnackBarService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group({
    isbn: ['', [Validators.required, isbnValidator]],
  });

  protected onScanned(isbn: string): void {
    this.form.controls.isbn.setValue(isbn);
    this.form.controls.isbn.markAsTouched();
    // Returning needs nothing else, so a scan is a submit.
    void this.submit();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      const book = await this.books.returnBook(toIsbn13(this.form.controls.isbn.value)!);
      this.snackBar.success(T.return.done(book.title, book.borrowedBy));
      this.form.reset();
    } catch (err) {
      this.snackBar.error(this.describe(err));
    } finally {
      this.busy.set(false);
    }
  }

  private describe(err: unknown): string {
    if (err instanceof LibraryError) {
      if (err.code === 'not-found') return T.common.notFound;
      if (err.code === 'not-borrowed') return T.return.notBorrowed;
    }
    return T.return.failed;
  }
}
