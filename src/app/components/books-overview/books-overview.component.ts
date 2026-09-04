import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';
import { BooksService } from '../../services/books.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { Book } from '../../shared/models';
import { T } from '../../shared/nl';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-books-overview',
  imports: [GoBackButtonComponent, MatProgressSpinnerModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './books-overview.component.html',
})
export class BooksOverviewComponent {
  private readonly booksService = inject(BooksService);
  private readonly snackBar = inject(SnackBarService);

  protected readonly t = T;

  /** `undefined` while loading; then a live list, borrowed books first. */
  protected readonly books = toSignal<Book[] | undefined>(
    this.booksService.getBooks().pipe(
      catchError(() => {
        this.snackBar.error(T.overview.loadFailed);
        return of([] as Book[]);
      }),
    ),
    { initialValue: undefined },
  );
}
