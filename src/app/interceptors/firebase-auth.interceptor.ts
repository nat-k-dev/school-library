// firebase-auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const firebaseAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: any) => {
      if (
        error instanceof HttpErrorResponse &&
        error.error?.error?.message === 'Missing or insufficient permissions.'
      ) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
