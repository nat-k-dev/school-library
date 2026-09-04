/**
 * A book as stored in Firestore under `books/{id}`.
 *
 * Phase 0 keeps the flat single-library model; phase 1 replaces it with
 * schools / students / copies / loans. Everything that reads or writes a book
 * should go through this type so the migration is a type-error hunt, not a
 * grep.
 */
export interface Book {
  /** Firestore document id. */
  id: string;
  /** ISBN-13 without dashes or spaces. */
  isbn: string;
  title: string;
  author: string;
  /** True while the book is on the shelf. */
  available: boolean;
  /** Name of the child who has the book; empty when available. */
  borrowedBy: string;
  /** Group (class) of the child, e.g. "5" or "1/2A"; empty when available. */
  group: string;
  /** ISO date (yyyy-mm-dd) the book was borrowed; empty when available. */
  borrowedAt: string;
}

/** Fields the user supplies when adding a book. */
export type NewBook = Pick<Book, 'isbn' | 'title' | 'author'>;

/** Fields the user supplies when lending a book. */
export interface LoanRequest {
  isbn: string;
  childName: string;
  group: string;
}
