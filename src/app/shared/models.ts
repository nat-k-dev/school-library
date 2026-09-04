/**
 * Data model. Every school is a tenant: all of its data lives under
 * `schools/{schoolId}/...` and is only readable by that school's members.
 *
 * Dates are ISO strings: `yyyy-mm-dd` for day-precision fields (loans) and a
 * full ISO timestamp for `createdAt`. They sort correctly, are readable in
 * the Firestore console and need no conversion in the UI.
 */

/**
 * Set by hand in the Firestore console; the app cannot change it.
 * 'trial' → full product until trialEndsAt; 'paid' → until paidUntil;
 * 'free' → the klassenbieb tier (see shared/plan.ts for the limits).
 */
export type Plan = 'free' | 'trial' | 'paid';

/** `schools/{id}` */
export interface School {
  id: string;
  name: string;
  plan: Plan;
  /** yyyy-mm-dd, only meaningful while plan is 'trial'. */
  trialEndsAt: string | null;
  /** yyyy-mm-dd, only meaningful while plan is 'paid'. */
  paidUntil: string | null;
  /** Copies not removed; kept in sync by LibraryService so the free tier can be checked cheaply. */
  copyCount: number;
  /** Next sequence number for a school-internal barcode. */
  nextInternalCode: number;
  /** Default loan period in days. */
  loanDays: number;
  /** Group names in display order, e.g. ["1/2A", "3", "4", ...]. */
  groups: string[];
  /** Colleagues enter this to join the school. */
  joinCode: string;
  createdAt: string;
  createdBy: string;
}

export type Role = 'beheerder' | 'medewerker';

/** `schools/{id}/members/{uid}` */
export interface Member {
  uid: string;
  role: Role;
  email: string;
  displayName: string;
  addedAt: string;
}

/** `schools/{id}/students/{id}`. Deliberately minimal: first name and group only. */
export interface Student {
  id: string;
  firstName: string;
  /** Optional; only needed when two children in a group share a first name. */
  lastName: string;
  group: string;
  active: boolean;
  createdAt: string;
}

export type TitleSource = 'google' | 'openlibrary' | 'manual';

/** `schools/{id}/titles/{isbn}`: one per ISBN, shared by all copies. */
export interface Title {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string | null;
  publisher: string;
  year: string;
  /** AVI level as printed on the book, e.g. "M4"; empty when unknown. */
  avi: string;
  source: TitleSource;
  createdAt: string;
}

export type CopyStatus = 'available' | 'onLoan' | 'lost' | 'removed';

/** `schools/{id}/copies/{id}`: a physical book. */
export interface Copy {
  id: string;
  isbn: string;
  /** Free text, e.g. shelf or "klas 5". */
  location: string;
  status: CopyStatus;
  createdAt: string;
}

/** `schools/{id}/loans/{id}`. Never deleted: this is the history. */
export interface Loan {
  id: string;
  copyId: string;
  isbn: string;
  /** Denormalised so history survives title or student edits. */
  title: string;
  studentId: string;
  studentName: string;
  group: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  byUid: string;
}

/** `users/{uid}` */
export interface UserProfile {
  uid: string;
  email: string;
  schoolIds: string[];
  createdAt: string;
}

/** `joinCodes/{code}` */
export interface JoinCode {
  schoolId: string;
}

/** What the ISBN lookup returns before the user confirms it. */
export type TitleDraft = Pick<Title, 'title' | 'author' | 'coverUrl' | 'publisher' | 'year' | 'source'>;

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function now(): string {
  return new Date().toISOString();
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function studentDisplayName(s: Pick<Student, 'firstName' | 'lastName'>): string {
  return s.lastName ? `${s.firstName} ${s.lastName}` : s.firstName;
}
