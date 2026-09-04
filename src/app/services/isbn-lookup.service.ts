import { Injectable } from '@angular/core';
import { environment } from '../../../injected-environment';
import { TitleDraft } from '../shared/models';

/**
 * Looks an ISBN up in public book databases.
 *
 * Open Library first: it allows browser requests without a key (CORS) and
 * covers a fair share of Dutch children's books. Google Books only when an
 * API key is configured, because keyless requests are rate-limited to zero
 * since 2026. Coverage is uneven either way, so the user can always correct
 * the result. The KB (national library) SRU service has the best Dutch
 * coverage but no CORS, so it needs a server-side proxy: phase 2.
 */
@Injectable({ providedIn: 'root' })
export class IsbnLookupService {
  async lookup(isbn: string): Promise<TitleDraft | null> {
    return (await this.openLibrary(isbn)) ?? (await this.googleBooks(isbn));
  }

  private async googleBooks(isbn: string): Promise<TitleDraft | null> {
    const key = environment.googleBooksKey;
    if (!key) return null;
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1&key=${key}`);
      if (!res.ok) return null;
      const data = (await res.json()) as GoogleVolumes;
      const info = data.items?.[0]?.volumeInfo;
      if (!info?.title) return null;
      return {
        title: info.title,
        author: (info.authors ?? []).join(', '),
        coverUrl: info.imageLinks?.thumbnail?.replace(/^http:/, 'https:') ?? null,
        publisher: info.publisher ?? '',
        year: (info.publishedDate ?? '').slice(0, 4),
        source: 'google',
      };
    } catch {
      return null;
    }
  }

  private async openLibrary(isbn: string): Promise<TitleDraft | null> {
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, OpenLibraryBook>;
      const book = data[`ISBN:${isbn}`];
      if (!book?.title) return null;
      return {
        title: book.title,
        author: (book.authors ?? []).map((a) => a.name).join(', '),
        coverUrl: book.cover?.medium ?? null,
        publisher: (book.publishers ?? []).map((p) => p.name).join(', '),
        year: (book.publish_date ?? '').match(/\d{4}/)?.[0] ?? '',
        source: 'openlibrary',
      };
    } catch {
      return null;
    }
  }
}

interface GoogleVolumes {
  items?: {
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      imageLinks?: { thumbnail?: string };
    };
  }[];
}

interface OpenLibraryBook {
  title?: string;
  authors?: { name: string }[];
  publishers?: { name: string }[];
  publish_date?: string;
  cover?: { medium?: string };
}
