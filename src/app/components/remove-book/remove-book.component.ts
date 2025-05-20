import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StrapiService } from '../../services/strapi.service';

@Component({
  selector: 'app-remove-book',
  imports: [ 
    GoBackButtonComponent, 
    MatFormField, 
    MatLabel, 
    MatInputModule, 
    MatButtonModule, 
    MatIcon, 
    FormsModule 
   ],
  templateUrl: './remove-book.component.html',
  styleUrl: './remove-book.component.css'
})
export class RemoveBookComponent {
  public bookISBN = '';

  constructor(private strapi: StrapiService) {}

  async RemoveBook() {
    await this.strapi.GetBooks().then((result: any) => {
      const books = result.data;
      const index = books.findIndex((book: any) => {
        return book.ISBN === this.bookISBN
      })
      if (index === -1) {
        alert('NOT FOUND')
      } else {
        const book = books[index];
        console.log(book);
        this.strapi.DeleteBook(book.documentId).then((result: any) => {
          alert(book.name + ' is succesfully deleted!');
        });
      }
      
    });

  }
  

}
