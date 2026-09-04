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
  selector: 'app-add-new-book',
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
  templateUrl: './add-new-book.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNewBookComponent {
  private readonly books = inject(BooksService);
  private readonly snackBar = inject(SnackBarService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group({
    isbn: ['', [Validators.required, isbnValidator]],
    title: ['', Validators.required],
    author: ['', Validators.required],
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
    const { isbn, title, author } = this.form.getRawValue();
    this.busy.set(true);
    try {
      await this.books.addBook({ isbn: toIsbn13(isbn)!, title, author });
      this.snackBar.success(T.add.done(title));
      this.form.reset();
    } catch (err) {
      this.snackBar.error(err instanceof LibraryError && err.code === 'duplicate-isbn' ? T.add.duplicate : T.add.failed);
    } finally {
      this.busy.set(false);
    }
  }
}
