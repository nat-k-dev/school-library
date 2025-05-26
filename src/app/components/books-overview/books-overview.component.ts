import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SnackBarService } from '../../services/snack-bar.service';
import { BooksService } from '../../services/books.service';
import {MatCardModule} from '@angular/material/card';
import { take } from 'rxjs';


interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  borrowed_by: string;
  date: string;
  group: string;
  available: boolean;
}

@Component({
  selector: 'app-books-overview',
  imports: [ GoBackButtonComponent, MatProgressSpinnerModule, MatCardModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './books-overview.component.html',
  styleUrl: './books-overview.component.css'
})
export class BooksOverviewComponent {
  loading = true;
  books: Book[] = [];

  constructor(private booksService: BooksService, private snackBarService: SnackBarService, private changeDet: ChangeDetectorRef) {
    this.booksService.GetBooks().pipe(take(1)).subscribe({
      next: (result: any) => {
        this.books.length = 0;
        this.books = result;
        this.loading = false;
        this.changeDet.detectChanges();     
      },
      error: (err: any) => {
        console.log(err);
        const message = '❌ Error. Something went wrong when getting books list';
        this.snackBarService.showMessage(message, 'Close');
        this.loading = false;
      }
    });
  }

}
