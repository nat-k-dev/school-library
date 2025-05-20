import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-homepage',
  imports: [ MatButtonModule, MatIconModule, RouterModule ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  constructor(private router: Router) {}

  AddNewBook() {
    this.router.navigateByUrl('add-new-book');
  }

  RemoveBook() {
    this.router.navigateByUrl('remove-book');
  }

  ReturnBook() {
    this.router.navigateByUrl('return-book');
  }

  BorrowBook() {
    this.router.navigateByUrl('borrow-book');
  }

}
