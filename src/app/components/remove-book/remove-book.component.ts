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
  selector: 'app-remove-book',
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
  templateUrl: './remove-book.component.html',
  styleUrl: './remove-book.component.css'
})
export class RemoveBookComponent {
  public bookISBN = '';
  public disableBtn = false;

  constructor(private strapi: StrapiService, private snackBarService: SnackBarService) {}

  async RemoveBook() {
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
        this.strapi.DeleteBook(book.documentId).then((result: any) => {
          const message = '"' + book.name + '"' + ' is succesfully deleted!';
          this.snackBarService.showMessage(message, 'Close');
          this.bookISBN = '';
          this.disableBtn = false;
        });
      }
    }).catch((err: any) => {
      const message = 'Error';
      this.snackBarService.showMessage(message, 'Close');
      this.disableBtn = false; 
    });
  }
  
}
