import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../app.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly zone = inject(NgZone);

  /** `undefined` until Firebase has restored the session; then the user or `null`. */
  readonly user = signal<User | null | undefined>(undefined);
  readonly ready = computed(() => this.user() !== undefined);
  readonly uid = computed(() => this.user()?.uid ?? null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => this.zone.run(() => this.user.set(user)));
  }

  /** Resolves once the initial session check has completed. */
  whenReady(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async register(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async loginWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return user;
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
