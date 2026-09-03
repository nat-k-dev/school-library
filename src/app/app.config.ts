import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../injected-environment';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Firestore is wired up against the plain Firebase SDK rather than
    // @angular/fire, which has no release for Angular 21 or later.
    {
      provide: Firestore,
      useFactory: () => getFirestore(getApps()[0] ?? initializeApp(environment.firebase)),
    },
    provideHttpClient()
  ]
};
