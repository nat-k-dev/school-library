import { Injectable, NgZone, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Book, NewBook } from '../shared/models';

export type LibraryErrorCode = 'not-found' | 'already-borrowed' | 'not-borrowed' | 'duplicate-isbn';

/** A business-rule failure the UI can translate; anything else is a real error. */
export class LibraryError extends Error {
  constructor(
    readonly code: LibraryErrorCode,
    readonly book?: Book,
  ) {
    super(code);
    this.name = 'LibraryError';
  }
}

/** Firestore field names. They differ from the model so existing data keeps working. */
interface BookDoc {
  isbn: string;
  title: string;
  author: string;
  available: boolean;
  borrowed_by: string;
  group: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly firestore = inject(Firestore);
  private readonly zone = inject(NgZone);
  private readonly booksRef = collection(this.firestore, 'books') as CollectionReference<BookDoc>;

  /** Live list of all books, re-emitted on every change. */
  getBooks(): Observable<Book[]> {
    // Firestore invokes the callbacks outside Angular's zone; hand them back in.
    return new Observable<Book[]>((subscriber) =>
      onSnapshot(
        this.booksRef,
        (snapshot) => this.zone.run(() => subscriber.next(snapshot.docs.map(toBook))),
        (error) => this.zone.run(() => subscriber.error(error)),
      ),
    );
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const snapshot = await getDocs(query(this.booksRef, where('isbn', '==', isbn), limit(1)));
    return snapshot.empty ? null : toBook(snapshot.docs[0]);
  }

  /** Throws `duplicate-isbn` when the ISBN is already in the library. */
  async addBook(book: NewBook): Promise<void> {
    if (await this.findByIsbn(book.isbn)) throw new LibraryError('duplicate-isbn');
    await addDoc(this.booksRef, {
      isbn: book.isbn,
      title: book.title.trim(),
      author: book.author.trim(),
      available: true,
      borrowed_by: '',
      group: '',
      date: '',
    });
  }

  /** Throws `not-found` or `already-borrowed` (with the book, so the UI can name the child). */
  async borrowBook(isbn: string, childName: string, group: string): Promise<Book> {
    const book = await this.requireBook(isbn);
    if (!book.available) throw new LibraryError('already-borrowed', book);
    const loan = { borrowedBy: childName.trim(), group: group.trim(), borrowedAt: today() };
    const patch: Partial<BookDoc> = {
      available: false,
      borrowed_by: loan.borrowedBy,
      group: loan.group,
      date: loan.borrowedAt,
    };
    await updateDoc(doc(this.booksRef, book.id), patch);
    return { ...book, ...loan, available: false };
  }

  /** Throws `not-found` or `not-borrowed`. Returns the book as it was before the return. */
  async returnBook(isbn: string): Promise<Book> {
    const book = await this.requireBook(isbn);
    if (book.available) throw new LibraryError('not-borrowed', book);
    const patch: Partial<BookDoc> = { available: true, borrowed_by: '', group: '', date: '' };
    await updateDoc(doc(this.booksRef, book.id), patch);
    return book;
  }

  /** Throws `not-found`. Returns the deleted book. */
  async deleteBook(isbn: string): Promise<Book> {
    const book = await this.requireBook(isbn);
    await deleteDoc(doc(this.booksRef, book.id));
    return book;
  }

  private async requireBook(isbn: string): Promise<Book> {
    const book = await this.findByIsbn(isbn);
    if (!book) throw new LibraryError('not-found');
    return book;
  }
}

function toBook(snapshot: QueryDocumentSnapshot<BookDoc, DocumentData>): Book {
  const data = snapshot.data();
  const borrowedBy = data.borrowed_by ?? '';
  return {
    id: snapshot.id,
    isbn: data.isbn ?? '',
    title: data.title ?? '',
    author: data.author ?? '',
    // Old documents never updated `available`; the borrower name is the truth.
    available: borrowedBy === '',
    borrowedBy,
    group: data.group ?? '',
    borrowedAt: data.date ?? '',
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
