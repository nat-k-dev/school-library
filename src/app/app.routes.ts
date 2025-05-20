import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AddNewBookComponent } from './components/add-new-book/add-new-book.component';
import { BorrowBookComponent } from './components/borrow-book/borrow-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { RemoveBookComponent } from './components/remove-book/remove-book.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent, title: 'Home page' },
    { path: 'add-new-book', component: AddNewBookComponent, title: 'Add new book' },
    { path: 'remove-book', component: RemoveBookComponent, title: 'Remove book' },
    { path: 'borrow-book', component: BorrowBookComponent, title: 'Borrow book' },
    { path: 'return-book', component: ReturnBookComponent, title: 'Return book' },
];
