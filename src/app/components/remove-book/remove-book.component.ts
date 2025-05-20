import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-remove-book',
  imports: [ GoBackButtonComponent ],
  templateUrl: './remove-book.component.html',
  styleUrl: './remove-book.component.css'
})
export class RemoveBookComponent {

}
