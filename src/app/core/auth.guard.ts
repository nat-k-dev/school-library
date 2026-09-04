import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Sends anonymous visitors to the login page, remembering where they wanted to go. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.whenReady();
  return user ? true : router.createUrlTree(['/login'], { queryParams: { next: state.url } });
};
