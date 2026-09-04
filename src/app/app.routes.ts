import { Routes } from '@angular/router';
import { AddNewBookComponent } from './components/add-new-book/add-new-book.component';
import { BooksOverviewComponent } from './components/books-overview/books-overview.component';
import { BorrowBookComponent } from './components/borrow-book/borrow-book.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { RemoveBookComponent } from './components/remove-book/remove-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { T } from './shared/nl';

const page = (name: string) => `${T.appName} | ${name}`;

export const routes: Routes = [
  { path: '', component: HomepageComponent, title: T.appName },
  { path: 'add-new-book', component: AddNewBookComponent, title: page(T.add.title) },
  { path: 'remove-book', component: RemoveBookComponent, title: page(T.remove.title) },
  { path: 'borrow-book', component: BorrowBookComponent, title: page(T.borrow.title) },
  { path: 'return-book', component: ReturnBookComponent, title: page(T.return.title) },
  { path: 'books-overview', component: BooksOverviewComponent, title: page(T.overview.title) },
  { path: '**', redirectTo: '' },
];
