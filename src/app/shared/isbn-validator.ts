import { AbstractControl, ValidationErrors } from '@angular/forms';
import { toIsbn13 } from './isbn';

/** Reactive-forms validator: the value must normalise to a valid ISBN-13. */
export function isbnValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value ?? '';
  if (value.trim() === '') return null; // leave "required" to Validators.required
  return toIsbn13(value) ? null : { isbn: true };
}
