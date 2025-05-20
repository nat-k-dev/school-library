import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SnackBarService } from '../../services/snack-bar.service';
import { StrapiService } from '../../services/strapi.service';
import {MatCardModule} from '@angular/material/card';

interface Book {
  "id": number;
  "documentId": string;
  "ISBN": string;
  "name": string;
  "Author": string;
  "is_borrowed": boolean;
  "child_name": string | null;
  "child_group": string | null;
  "date": string | null;
  "createdAt": string;
  "updatedAt": string;
  "publishedAt": string;
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

  constructor(private strapi: StrapiService, private snackBarService: SnackBarService, private changeDet: ChangeDetectorRef) {
    this.strapi.GetBooks().then((result: any) => {
      this.books.length = 0;
      this.books = result.data;
      this.loading = false;
      this.changeDet.detectChanges();     
    }).catch((err: any) => {
      const message = 'Error. Something went wrong when getting books list';
      this.snackBarService.showMessage(message, 'Close');
      this.loading = false;
    });
  }

}
