import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  private booksRef;

  constructor(private firestore: Firestore) {
    this.booksRef = collection(this.firestore, 'books');
  }

  getBooks(): Observable<any[]> {
    return collectionData(this.booksRef, { idField: 'id' });
  }

  addBook(book: any) {
    return addDoc(this.booksRef, book);
  }

  deleteBook(id: string) {
    const bookDoc = doc(this.firestore, `books/${id}`);
    return deleteDoc(bookDoc);
  }

  updateBook(id: string, data: Partial<any>) {
    const bookDoc = doc(this.firestore, `books/${id}`);
    return updateDoc(bookDoc, data);
  }
}
