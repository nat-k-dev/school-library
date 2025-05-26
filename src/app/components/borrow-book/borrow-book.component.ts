import { Component, OnDestroy } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BooksService } from '../../services/books.service';
import { SnackBarService } from '../../services/snack-bar.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, Result } from "@zxing/library";
import { BarcodeFormat } from '@zxing/library';
import { take } from 'rxjs';

@Component({
  selector: 'app-borrow-book',
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
  templateUrl: './borrow-book.component.html',
  styleUrl: './borrow-book.component.css'
})
export class BorrowBookComponent implements OnDestroy {
  public bookISBN = '';
  public childName = '';
  public childGroup = '';
  public disableBtn = false;

  private codeReader = new BrowserMultiFormatReader();
  private controls?: IScannerControls;
  scannedResult: string | null = null;
  showCamera = false;

  constructor(private booksService: BooksService, private snackBarService: SnackBarService) {}

  
scanWithCamera() {
    this.showCamera = true;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

    this.codeReader.decodeFromVideoDevice(undefined, 'video', (result: Result | undefined, error, controls) => {
      this.controls = controls;

      if (result) {
        this.scannedResult = result.getText();
        this.bookISBN = this.scannedResult;
      }
    });
  }

  ngOnDestroy(): void {
    this.controls?.stop();
  }

  async BorrowBook() {
    this.disableBtn = true;
    this.booksService.GetBooks().pipe(take(1)).subscribe({
      next: (result: any) => {
        const books = result;
        const index = books.findIndex((book: any) => {
          return book.isbn === this.bookISBN
        })
        if (index === -1) {
          this.snackBarService.showMessage('❌ Book is not found', 'Close');
          this.disableBtn = false; 
        } else {
          const book = books[index];

          this.booksService.BorrowBook(book.id, this.childName, this.childGroup, new Date().toISOString().split('T')[0]).then((result: any) => {
            const message = '✅ "' + book.title + '"' + ' is succesfully borrowed by ' + this.childName;
            this.snackBarService.showMessage(message, 'Close');
            this.bookISBN = '';
            this.childGroup = '';
            this.childName = '';
            this.scannedResult = '';
            this.disableBtn = false;
          }).catch((err: any) => {
            console.log(err);
            const message = '❌ Error. Maybe book has been already taken';
            this.snackBarService.showMessage(message, 'Close');
            this.disableBtn = false; 
          });
        }     
      },
      error: (err: any) => {
        console.log(err);
        const message = '❌ Error. Something went wrong when searching for this book';
        this.snackBarService.showMessage(message, 'Close');
        this.disableBtn = false; 
      }
    });
  }

}
