import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { BooksService, LibraryError } from '../../services/books.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { toIsbn13 } from '../../shared/isbn';
import { isbnValidator } from '../../shared/isbn-validator';
import { T } from '../../shared/nl';
import { ScannerComponent } from '../../shared/scanner/scanner.component';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-remove-book',
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
  templateUrl: './remove-book.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveBookComponent {
  private readonly books = inject(BooksService);
  private readonly snackBar = inject(SnackBarService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = T;
  protected readonly busy = signal(false);
  protected readonly form = this.fb.group({
    isbn: ['', [Validators.required, isbnValidator]],
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
    const isbn = toIsbn13(this.form.controls.isbn.value)!;
    this.busy.set(true);
    try {
      const book = await this.books.findByIsbn(isbn);
      if (!book) {
        this.snackBar.error(T.common.notFound);
        return;
      }
      if (!(await this.confirm(book.title))) return;
      await this.books.deleteBook(isbn);
      this.snackBar.success(T.remove.done(book.title));
      this.form.reset();
    } catch (err) {
      this.snackBar.error(err instanceof LibraryError && err.code === 'not-found' ? T.common.notFound : T.remove.failed);
    } finally {
      this.busy.set(false);
    }
  }

  private confirm(title: string): Promise<boolean> {
    const data: ConfirmDialogData = {
      message: T.remove.confirm(title),
      confirmLabel: T.remove.confirmYes,
      cancelLabel: T.remove.confirmNo,
    };
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, { data });
    return firstValueFrom(ref.afterClosed()).then((result) => result === true);
  }
}
