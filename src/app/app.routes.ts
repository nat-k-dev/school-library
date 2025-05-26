import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AddNewBookComponent } from './components/add-new-book/add-new-book.component';
import { BorrowBookComponent } from './components/borrow-book/borrow-book.component';
import { ReturnBookComponent } from './components/return-book/return-book.component';
import { RemoveBookComponent } from './components/remove-book/remove-book.component';
import { BooksOverviewComponent } from './components/books-overview/books-overview.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: HomepageComponent, title: 'School library', canActivate: [authGuard] },
    { path: 'add-new-book', component: AddNewBookComponent, title: 'School library | Add new book', canActivate: [authGuard] },
    { path: 'remove-book', component: RemoveBookComponent, title: 'School library | Remove book', canActivate: [authGuard] },
    { path: 'borrow-book', component: BorrowBookComponent, title: 'School library | Borrow book', canActivate: [authGuard] },
    { path: 'return-book', component: ReturnBookComponent, title: 'School library | Return book', canActivate: [authGuard] },
    { path: 'books-overview', component: BooksOverviewComponent, title: 'School library | Overview', canActivate: [authGuard] },
    { path: 'login', component: LoginComponent, title: 'School library | Login' },
];
