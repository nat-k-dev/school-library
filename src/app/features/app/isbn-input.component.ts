import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    <div class="flex flex-col gap-3 items-stretch pt-3">
      <app-scanner (scanned)="emit($event)" />
      <!-- [formGroup] is what turns (ngSubmit) on; without it the browser does a native submit and reloads. -->
      <form class="flex gap-2 items-start" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field class="input-field">
          <mat-label>{{ t.fields.isbn }}</mat-label>
          <input matInput formControlName="isbn" inputmode="numeric" autocomplete="off">
          @if (form.controls.isbn.hasError('required')) {
            <mat-error>{{ t.fields.required }}</mat-error>
          } @else if (form.controls.isbn.hasError('isbn')) {
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

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly t = T;
  protected readonly form = this.fb.group({
    isbn: ['', [Validators.required, isbnValidator]],
  });
  protected readonly last = signal<string | null>(null);

  protected submit(): void {
    if (this.disabled()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.emit(toIsbn13(this.form.controls.isbn.value)!);
  }

  protected emit(isbn: string): void {
    this.form.controls.isbn.setValue(isbn);
    this.last.set(isbn);
    this.isbn.emit(isbn);
  }

  reset(): void {
    this.form.reset();
    this.last.set(null);
  }
}
