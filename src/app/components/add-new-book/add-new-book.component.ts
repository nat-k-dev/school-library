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
  selector: 'app-add-new-book',
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
  templateUrl: './add-new-book.component.html',
  styleUrl: './add-new-book.component.css'
})
export class AddNewBookComponent {
  public bookISBN = '';
  public bookName = '';
  public bookAuthor = '';
  public disableBtn = false;
  

  constructor(private strapi: StrapiService, private snackBarService: SnackBarService) {}

  async AddNewBook() {
    this.disableBtn = true;
    await this.strapi.PostBook(this.bookISBN, this.bookName, this.bookAuthor).then((result: any) => {
      const message = '"' + this.bookName + '"' + ' is added!';
      this.snackBarService.showMessage(message, 'Close');
      this.bookISBN = '';
      this.bookName = '';
      this.bookAuthor = '';
      this.disableBtn = false;
    }).catch((err: any) => {
      const message = 'Error. Maybe book with this ISBN has been already added';
      this.snackBarService.showMessage(message, 'Close');
      this.disableBtn = false; 
    });
  }

}
