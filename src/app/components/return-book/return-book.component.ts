import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StrapiService } from '../../services/strapi.service';
import { SnackBarService } from '../../services/snack-bar.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-return-book',
  imports: [ 
    GoBackButtonComponent, 
    MatFormField, 
    MatLabel, 
    MatInputModule, 
    MatButtonModule, 
    MatIcon, 
    FormsModule,
    MatProgressSpinnerModule,
   ],
  templateUrl: './return-book.component.html',
  styleUrl: './return-book.component.css'
})
export class ReturnBookComponent {
  public bookISBN = '';
  public disableBtn = false;

  constructor(private strapi: StrapiService, private snackBarService: SnackBarService) {}

  async ReturnBook() {
    this.disableBtn = true;
    await this.strapi.GetBooks().then((result: any) => {
      const books = result.data;
      const index = books.findIndex((book: any) => {
        return book.ISBN === this.bookISBN
      })
      if (index === -1) {
        this.snackBarService.showMessage('Book is not found', 'Close');
        this.disableBtn = false; 
      } else {
        const book = books[index];
        console.log(book);
        this.strapi.ReturnBook(book.documentId, '', '').then((result: any) => {
          const message = '"' + book.name + '"' + ' is succesfully returned by ' + book.child_name;
          this.snackBarService.showMessage(message, 'Close');
          this.bookISBN = '';
          this.disableBtn = false; 
        }).catch((err: any) => {
          const message = 'Error. Something went wrong when trying to return book';
          this.snackBarService.showMessage(message, 'Close');
          this.disableBtn = false; 
        });
      }
    }).catch((err: any) => {
      const message = 'Error. Something went wrong when searching for this book';
      this.snackBarService.showMessage(message, 'Close');
      this.disableBtn = false; 
    });;
  }
}
