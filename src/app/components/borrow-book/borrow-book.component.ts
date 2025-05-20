import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StrapiService } from '../../services/strapi.service';

@Component({
  selector: 'app-borrow-book',
  imports: [ 
    GoBackButtonComponent, 
    MatFormField, 
    MatLabel, 
    MatInputModule, 
    MatButtonModule, 
    MatIcon, 
    FormsModule 
   ],
  templateUrl: './borrow-book.component.html',
  styleUrl: './borrow-book.component.css'
})
export class BorrowBookComponent {
  public bookISBN = '';
  public childName = '';
  public childGroup = '';

  constructor(private strapi: StrapiService) {}

  async BorrowBook() {
    console.log('borrow')
    await this.strapi.GetBooks().then((result: any) => {
      console.log(result)
      const books = result.data;
      const index = books.findIndex((book: any) => {
        console.log('book=', book)
        return book.ISBN === this.bookISBN
      })
      if (index === -1) {
        alert('Book is not found')
      } else {
        const book = books[index];
        console.log(book);
        this.strapi.BorrowBook(book.documentId, this.childName, this.childGroup, new Date().toISOString().split('T')[0]).then((result: any) => {
          alert(book.name + ' is succesfully borrowed by ' + this.childName);
        });
      }
    });
  }

}
