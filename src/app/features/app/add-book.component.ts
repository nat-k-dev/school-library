import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { SchoolService } from '../../core/school.service';
import { IsbnLookupService } from '../../services/isbn-lookup.service';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { isInternalCode, toIsbn13 } from '../../shared/isbn';
import { TitleDraft } from '../../shared/models';
import { T } from '../../shared/nl';
import { IsbnInputComponent } from './isbn-input.component';
import { LockedComponent } from './locked.component';

@Component({
  selector: 'app-add-book',
  imports: [IsbnInputComponent, LockedComponent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-book.component.html',
})
export class AddBookComponent {
  private readonly library = inject(LibraryService);
  private readonly lookup = inject(IsbnLookupService);
  private readonly snackBar = inject(SnackBarService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly school = inject(SchoolService);

  /** Query parameter `?isbn=`: pre-filled by the borrow screen when it meets an unknown book. */
  readonly isbn = input<string | undefined>(undefined);

  protected readonly t = T;
  protected readonly current = signal<string | null>(null);
  protected readonly lookingUp = signal(false);
  protected readonly busy = signal(false);
  protected readonly notice = signal<string | null>(null);
  protected readonly existingCopies = signal(0);
  protected readonly coverUrl = signal<string | null>(null);
  private draft: TitleDraft | null = null;

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    author: [''],
    avi: [''],
    copies: [1, [Validators.required, Validators.min(1)]],
    location: [''],
  });

  constructor() {
    effect(() => {
      const fromUrl = this.isbn();
      const isbn = fromUrl ? toIsbn13(fromUrl) : null;
      if (isbn) void this.onIsbn(isbn);
    });
  }

  protected async onIsbn(isbn: string): Promise<void> {
    this.current.set(isbn);
    this.lookingUp.set(true);
    this.notice.set(null);
    this.form.reset({ copies: 1 });
    try {
      const [existing, counts] = await Promise.all([this.library.getTitle(isbn), this.library.countCopies(isbn)]);
      this.existingCopies.set(counts.total);
      if (existing) {
        this.draft = existing;
        this.coverUrl.set(existing.coverUrl);
        this.form.patchValue({ title: existing.title, author: existing.author, avi: existing.avi });
        this.notice.set(T.addBook.alreadyHave(counts.total));
        return;
      }
      const found = await this.lookup.lookup(isbn);
      this.draft = found;
      this.coverUrl.set(found?.coverUrl ?? null);
      if (found) {
        this.form.patchValue({ title: found.title, author: found.author });
        this.notice.set(T.addBook.found);
      } else {
        this.notice.set(isInternalCode(isbn) ? T.addBook.internalCode : T.addBook.notFound);
      }
    } catch {
      this.snackBar.error(T.common.genericError);
    } finally {
      this.lookingUp.set(false);
    }
  }

  protected async submit(): Promise<void> {
    const isbn = this.current();
    if (!isbn || this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const draft: TitleDraft & { avi: string } = {
      title: value.title,
      author: value.author,
      avi: value.avi,
      coverUrl: this.draft?.coverUrl ?? null,
      publisher: this.draft?.publisher ?? '',
      year: this.draft?.year ?? '',
      source: this.draft?.source ?? 'manual',
    };
    this.busy.set(true);
    try {
      await this.library.addTitleWithCopies(isbn, draft, value.copies, value.location);
      this.snackBar.success(T.addBook.done(value.title, value.copies));
      this.reset();
    } catch {
      this.snackBar.error(T.addBook.failed);
    } finally {
      this.busy.set(false);
    }
  }

  /** For a book without a barcode: reserve a school-internal code and continue as if it was scanned. */
  protected async newInternalCode(): Promise<void> {
    this.busy.set(true);
    try {
      const code = await this.school.allocateInternalCode();
      await this.onIsbn(code);
    } catch {
      this.snackBar.error(T.common.genericError);
    } finally {
      this.busy.set(false);
    }
  }

  protected reset(): void {
    this.current.set(null);
    this.notice.set(null);
    this.coverUrl.set(null);
    this.draft = null;
    this.form.reset({ copies: 1 });
  }
}
