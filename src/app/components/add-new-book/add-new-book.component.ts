import { Component, OnDestroy } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StrapiService } from '../../services/strapi.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, Result } from "@zxing/library";
import { BarcodeFormat } from '@zxing/library';


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
export class AddNewBookComponent implements  OnDestroy {
  public bookISBN = '';
  public bookName = '';
  public bookAuthor = '';
  public disableBtn = false;
  
  private codeReader = new BrowserMultiFormatReader();
  private controls?: IScannerControls;
  scannedResult: string | null = null;
  showCamera = false;

  constructor(private strapi: StrapiService, private snackBarService: SnackBarService) {}

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

  async AddNewBook() {
    this.disableBtn = true;
    await this.strapi.PostBook(this.bookISBN, this.bookName, this.bookAuthor).then((result: any) => {
      const message = '"' + this.bookName + '"' + ' is added!';
      this.snackBarService.showMessage(message, 'Close');
      this.bookISBN = '';
      this.bookName = '';
      this.bookAuthor = '';
      this.scannedResult = '';
      this.disableBtn = false;
    }).catch((err: any) => {
      const message = 'Error. Maybe book with this ISBN has been already added';
      this.snackBarService.showMessage(message, 'Close');
      this.disableBtn = false; 
    });
  }

}
