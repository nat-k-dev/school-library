import { Injectable, NgZone } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private booksRef;

  constructor(private firestore: Firestore, private zone: NgZone) {
    this.booksRef = collection(this.firestore, 'books');
  }

  AddBook(isbn: string, title: string, author: string) {
    const book = {
      isbn: isbn,
      title: title,
      author: author,
      available: true,
      borrowed_by: '',
      date: '',
      group: '',
    }
    return addDoc(this.booksRef, book);
  }

  GetBooks(): Observable<any[]> {
    // Stands in for AngularFire's collectionData: a live snapshot listener,
    // with each document keyed by its own id. Firestore invokes the callbacks
    // outside Angular's zone, so emissions are handed back inside it.
    return new Observable<any[]>((subscriber) =>
      onSnapshot(
        this.booksRef,
        (snapshot) => this.zone.run(() =>
          subscriber.next(snapshot.docs.map((book) => ({ ...book.data(), id: book.id })))
        ),
        (error) => this.zone.run(() => subscriber.error(error))
      )
    );
  }

  BorrowBook(id: number, childName: string, childGroup: string, date: string) {
    const bookDoc = doc(this.firestore, `books/${id}`);
    const data = {
      borrowed_by: childName,
      group: childGroup,
      date: date
    };
    return updateDoc(bookDoc, data);
  }

  ReturnBook(id: number) {
    const bookDoc = doc(this.firestore, `books/${id}`);
    const data = {
      borrowed_by: '',
      group: '',
      date: ''
    };
    return updateDoc(bookDoc, data);
  }

  DeleteBook(id: number) {
    const bookDoc = doc(this.firestore, `books/${id}`);
    return deleteDoc(bookDoc);
  }
}
