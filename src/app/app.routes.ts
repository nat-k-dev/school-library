import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AddNewBookComponent } from './components/add-new-book/add-new-book.component';
import { BorrowBookComponent } from './components/borrow-book/borrow-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { RemoveBookComponent } from './components/remove-book/remove-book.component';
import { BooksOverviewComponent } from './components/books-overview/books-overview.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent, title: 'School library' },
    { path: 'add-new-book', component: AddNewBookComponent, title: 'School library | Add new book' },
    { path: 'remove-book', component: RemoveBookComponent, title: 'School library | Remove book' },
    { path: 'borrow-book', component: BorrowBookComponent, title: 'School library | Borrow book' },
    { path: 'return-book', component: ReturnBookComponent, title: 'School library | Return book' },
    { path: 'books-overview', component: BooksOverviewComponent, title: 'School library | Overview' },
];
