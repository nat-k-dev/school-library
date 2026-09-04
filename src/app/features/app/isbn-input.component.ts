import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { toIsbn13 } from '../../shared/isbn';
import { isbnValidator } from '../../shared/isbn-validator';
import { T } from '../../shared/nl';
import { ScannerComponent } from '../../shared/scanner/scanner.component';

/**
 * "Scan or type an ISBN" step shared by borrow, return and add-book.
 * Emits a clean ISBN-13 either straight from the camera or when the typed
 * value is submitted.
 */
@Component({
  selector: 'app-isbn-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ScannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 items-stretch">
      <app-scanner (scanned)="emit($event)" />
      <form class="flex gap-2 items-start" (ngSubmit)="submit()">
        <mat-form-field class="input-field">
          <mat-label>{{ t.fields.isbn }}</mat-label>
          <input matInput [formControl]="control" inputmode="numeric" autocomplete="off" [disabled]="disabled()">
          @if (control.hasError('required')) {
            <mat-error>{{ t.fields.required }}</mat-error>
          } @else if (control.hasError('isbn')) {
            <mat-error>{{ t.fields.invalidIsbn }}</mat-error>
          }
        </mat-form-field>
        <button mat-flat-button type="submit" class="mt-2 h-14! whitespace-nowrap" [disabled]="disabled()">
          <mat-icon>search</mat-icon>{{ buttonLabel() }}
        </button>
      </form>
    </div>
  `,
})
export class IsbnInputComponent {
  readonly buttonLabel = input<string>(T.borrow.lookup);
  readonly disabled = input(false);
  readonly isbn = output<string>();

  protected readonly t = T;
  protected readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required, isbnValidator] });
  protected readonly last = signal<string | null>(null);

  protected submit(): void {
    if (this.control.invalid) {
      this.control.markAsTouched();
      return;
    }
    this.emit(toIsbn13(this.control.value)!);
  }

  protected emit(isbn: string): void {
    this.control.setValue(isbn);
    this.last.set(isbn);
    this.isbn.emit(isbn);
  }

  reset(): void {
    this.control.reset();
    this.last.set(null);
  }
}
