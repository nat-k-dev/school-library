import { Injectable } from '@angular/core';
import Strapi from 'strapi-sdk-javascript';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  readonly strapiURL = 'https://clever-thrill-d79f17c8f9.strapiapp.com';
  private strapi: Strapi = new Strapi(this.strapiURL);

  constructor() { }

  PostBook(isbn: string, name: string, author: string) {
    return this.strapi.request('post', 'api/books', {
      data: {
        data: {
          ISBN: isbn,
          name: name,
          Author: author
        }
      }
    });
  }

  GetBooks() {
    return this.strapi.request('get', 'api/books');
  }

  GetBook(id: number) {
    return this.strapi.request('get', 'api/books/' + id);
  }

  PutBook(id: number) {
    return this.strapi.request('put', 'api/books/' + id);
  }

  DeleteBook(id: number) {
    return this.strapi.request('delete', 'api/books/' + id);
  }
}
