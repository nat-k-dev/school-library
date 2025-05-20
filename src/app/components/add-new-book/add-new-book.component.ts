import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-new-book',
  imports: [ 
    GoBackButtonComponent, 
    MatFormField, 
    MatLabel, 
    MatInputModule, 
    MatButtonModule, 
    MatIcon, 
    FormsModule 
  ],
  templateUrl: './add-new-book.component.html',
  styleUrl: './add-new-book.component.css'
})
export class AddNewBookComponent {
  public bookISBN = '';
  public bookName = '';
  public bookAuthor = '';

  AddNewBook() {
    console.log(this.bookISBN, this.bookName, this.bookAuthor)
  }

}
