import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { T } from './shared/nl';

const page = (name: string) => `${T.appName} | ${name}`;

export const routes: Routes = [
  {
    path: '',
    title: T.appName,
    loadComponent: () => import('./features/public/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'privacy',
    title: page(T.privacy.title),
    loadComponent: () => import('./features/public/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'login',
    title: page(T.auth.loginTitle),
    loadComponent: () => import('./features/public/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registreren',
    title: page(T.auth.registerTitle),
    loadComponent: () => import('./features/public/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/app/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'uitlenen', pathMatch: 'full' },
      {
        path: 'uitlenen',
        title: page(T.nav.borrow),
        loadComponent: () => import('./features/app/borrow.component').then((m) => m.BorrowComponent),
      },
      {
        path: 'innemen',
        title: page(T.nav.return),
        loadComponent: () => import('./features/app/return.component').then((m) => m.ReturnComponent),
      },
      {
        path: 'overzicht',
        title: page(T.nav.loans),
        loadComponent: () => import('./features/app/loans.component').then((m) => m.LoansComponent),
      },
      {
        path: 'boeken',
        title: page(T.nav.books),
        loadComponent: () => import('./features/app/books.component').then((m) => m.BooksComponent),
      },
      {
        path: 'boeken/nieuw',
        title: page(T.addBook.title),
        loadComponent: () => import('./features/app/add-book.component').then((m) => m.AddBookComponent),
      },
      {
        path: 'boeken/etiketten',
        title: page(T.labels.title),
        loadComponent: () => import('./features/app/labels.component').then((m) => m.LabelsComponent),
      },
      {
        path: 'leerlingen',
        title: page(T.nav.students),
        loadComponent: () => import('./features/app/students.component').then((m) => m.StudentsComponent),
      },
      {
        path: 'instellingen',
        title: page(T.nav.settings),
        loadComponent: () => import('./features/app/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
