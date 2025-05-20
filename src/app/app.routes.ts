import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AddNewBookComponent } from './components/add-new-book/add-new-book.component';
import { BorrowBookComponent } from './components/borrow-book/borrow-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { RemoveBookComponent } from './components/remove-book/remove-book.component';
import { BooksOverviewComponent } from './components/books-overview/books-overview.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent, title: 'Biebouders' },
    { path: 'add-new-book', component: AddNewBookComponent, title: 'Biebouders | Add new book' },
    { path: 'remove-book', component: RemoveBookComponent, title: 'Biebouders | Remove book' },
    { path: 'borrow-book', component: BorrowBookComponent, title: 'Biebouders | Borrow book' },
    { path: 'return-book', component: ReturnBookComponent, title: 'Biebouders | Return book' },
    { path: 'books-overview', component: BooksOverviewComponent, title: 'Biebouders | Overview' },
];
