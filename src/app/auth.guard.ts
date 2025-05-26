// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user$ = user(auth); // Observable<User | null>

  return user$.pipe(
    map((authUser) => {
      if (authUser) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
