import { NgZone } from '@angular/core';
import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  onSnapshot,
} from 'firebase/firestore';
import { Observable } from 'rxjs';

/** A document with its id merged in; the shape every model in models.ts follows. */
export function withId<T>(snapshot: QueryDocumentSnapshot | DocumentSnapshot, idField = 'id'): T {
  return { ...(snapshot.data() ?? {}), [idField]: snapshot.id } as T;
}

/**
 * Live query as an Observable. Firestore fires callbacks outside Angular's
 * zone, so emissions are handed back in; signals then update the view.
 */
export function collectionChanges<T>(zone: NgZone, query: Query, idField = 'id'): Observable<T[]> {
  return new Observable<T[]>((subscriber) =>
    onSnapshot(
      query,
      (snapshot) => zone.run(() => subscriber.next(snapshot.docs.map((d) => withId<T>(d, idField)))),
      (error) => zone.run(() => subscriber.error(error)),
    ),
  );
}

/** Live document as an Observable; emits `null` when it does not exist. */
export function documentChanges<T>(zone: NgZone, ref: DocumentReference, idField = 'id'): Observable<T | null> {
  return new Observable<T | null>((subscriber) =>
    onSnapshot(
      ref,
      (snapshot) => zone.run(() => subscriber.next(snapshot.exists() ? withId<T>(snapshot, idField) : null)),
      (error) => zone.run(() => subscriber.error(error)),
    ),
  );
}

/** Firestore batches are capped at 500 writes. */
export function chunk<T>(items: T[], size = 450): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
