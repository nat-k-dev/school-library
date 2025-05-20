import { Component } from '@angular/core';
import { GoBackButtonComponent } from '../go-back-button/go-back-button.component';

@Component({
  selector: 'app-add-new-book',
  imports: [ GoBackButtonComponent ],
  templateUrl: './add-new-book.component.html',
  styleUrl: './add-new-book.component.css'
})
export class AddNewBookComponent {

}
