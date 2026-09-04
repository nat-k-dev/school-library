import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { Copy, Title } from '../../shared/models';
import { T } from '../../shared/nl';

interface Row {
  title: Title;
  copies: Copy[];
  total: number;
  available: number;
}

@Component({
  selector: 'app-books',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './books.component.html',
})
export class BooksComponent {
  private readonly library = inject(LibraryService);
  private readonly snackBar = inject(SnackBarService);

  protected readonly t = T;
  protected readonly search = signal('');
  protected readonly location = signal('');
  protected readonly locations = computed(() =>
    [...new Set((this.library.copies() ?? []).filter((c) => c.status !== 'removed').map((c) => c.location).filter((l) => l !== ''))].sort((a, b) =>
      a.localeCompare(b, 'nl', { numeric: true }),
    ),
  );
  protected readonly busy = signal<string | null>(null);
  protected readonly loaded = computed(() => this.library.titles() !== undefined && this.library.copies() !== undefined);

  protected readonly rows = computed<Row[]>(() => {
    const copiesByIsbn = new Map<string, Copy[]>();
    for (const copy of this.library.copies() ?? []) {
      if (copy.status === 'removed') continue;
      copiesByIsbn.set(copy.isbn, [...(copiesByIsbn.get(copy.isbn) ?? []), copy]);
    }
    return (this.library.titles() ?? [])
      .map((title) => {
        const copies = copiesByIsbn.get(title.isbn) ?? [];
        return { title, copies, total: copies.length, available: copies.filter((c) => c.status === 'available').length };
      })
      .sort((a, b) => a.title.title.localeCompare(b.title.title, 'nl'));
  });

  protected readonly visible = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const location = this.location();
    return this.rows()
      .filter((r) => !location || r.copies.some((c) => c.location === location))
      .filter(
        (r) => !needle || r.title.title.toLowerCase().includes(needle) || r.title.author.toLowerCase().includes(needle) || r.title.isbn.includes(needle),
      );
  });

  protected async addCopy(row: Row): Promise<void> {
    await this.run(row.title.isbn, () => this.library.addTitleWithCopies(row.title.isbn, row.title, 1));
  }

  protected async markCopy(row: Row, status: 'lost' | 'removed'): Promise<void> {
    const copy = row.copies.find((c) => c.status === 'available') ?? row.copies.find((c) => c.status === 'lost');
    if (!copy) return;
    await this.run(row.title.isbn, () => this.library.setCopyStatus(copy, status));
  }

  private async run(isbn: string, action: () => Promise<void>): Promise<void> {
    this.busy.set(isbn);
    try {
      await action();
      this.snackBar.success(T.books.saved);
    } catch {
      this.snackBar.error(T.common.genericError);
    } finally {
      this.busy.set(null);
    }
  }
}
