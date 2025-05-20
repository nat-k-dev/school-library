import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-return-book',
  imports: [ GoBackButtonComponent ],
  templateUrl: './return-book.component.html',
  styleUrl: './return-book.component.css'
})
export class ReturnBookComponent {

}
