import { FirebaseError } from 'firebase/app';
import { T } from '../../shared/nl';

/** Translates a Firebase Auth failure into a sentence the user can act on. */
export function describeAuthError(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : '';
  const e = T.auth.errors;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return e.invalidCredential;
    case 'auth/email-already-in-use':
      return e.emailInUse;
    case 'auth/weak-password':
      return e.weakPassword;
    case 'auth/invalid-email':
      return e.invalidEmail;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return e.popupClosed;
    default:
      return e.generic;
  }
}
