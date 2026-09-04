import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '../../injected-environment';
import { routes } from './app.routes';

/** `Auth` is an interface, so it needs a token; `Firestore` is a class and is its own token. */
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');

function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(environment.firebase);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Plain Firebase SDK rather than @angular/fire, which lags behind Angular releases.
    {
      provide: FIREBASE_AUTH,
      useFactory: () => {
        const auth = getAuth(firebaseApp());
        if (environment.useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        return auth;
      },
    },
    {
      provide: Firestore,
      useFactory: () => {
        const db = getFirestore(firebaseApp());
        if (environment.useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080);
        return db;
      },
    },
  ],
};
