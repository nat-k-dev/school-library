import { Injectable } from '@angular/core';
import Strapi from 'strapi-sdk-javascript';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class BooksService {
  readonly strapiURL = 'https://clever-thrill-d79f17c8f9.strapiapp.com';
  private strapi: Strapi = new Strapi(this.strapiURL);

  private booksRef;

  constructor(private firestore: Firestore, private authService: AuthService) {
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
    return collectionData(this.booksRef, { idField: 'id' });
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
