import { Injectable, NgZone, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { collectionChanges, withId } from '../core/firestore.util';
import { SchoolService } from '../core/school.service';
import { Copy, Loan, Student, Title, TitleDraft, addDays, now, studentDisplayName, today } from '../shared/models';

export type LibraryErrorCode = 'unknown-title' | 'no-copy-available' | 'not-on-loan';

/** A business-rule failure the UI can translate; anything else is a real error. */
export class LibraryError extends Error {
  constructor(readonly code: LibraryErrorCode) {
    super(code);
    this.name = 'LibraryError';
  }
}

/** Titles, copies and loans of the current school. */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly db = inject(Firestore);
  private readonly zone = inject(NgZone);
  private readonly school = inject(SchoolService);
  private readonly auth = inject(AuthService);

  /** Live list of all titles; `undefined` while loading. Subscribed only while a screen reads it. */
  readonly titles = toSignal(
    toObservable(this.school.schoolId).pipe(
      switchMap((id) =>
        id ? collectionChanges<Title>(this.zone, this.school.schoolCollection('titles'), 'isbn') : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  readonly copies = toSignal(
    toObservable(this.school.schoolId).pipe(
      switchMap((id) => (id ? collectionChanges<Copy>(this.zone, this.school.schoolCollection('copies')) : of(undefined))),
    ),
    { initialValue: undefined },
  );

  /** Live list of loans not yet returned. */
  readonly activeLoans = toSignal(
    toObservable(this.school.schoolId).pipe(
      switchMap((id) =>
        id
          ? collectionChanges<Loan>(
              this.zone,
              query(this.school.schoolCollection('loans'), where('returnedAt', '==', null)),
            )
          : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  /** How many copies of an ISBN the school owns and how many are on the shelf right now. */
  async countCopies(isbn: string): Promise<{ total: number; available: number }> {
    const snap = await getDocs(query(this.school.schoolCollection('copies'), where('isbn', '==', isbn)));
    const copies = snap.docs.map((d) => withId<Copy>(d)).filter((c) => c.status !== 'removed');
    return { total: copies.length, available: copies.filter((c) => c.status === 'available').length };
  }

  async getTitle(isbn: string): Promise<Title | null> {
    const snap = await getDoc(this.school.schoolDoc('titles', isbn));
    return snap.exists() ? withId<Title>(snap, 'isbn') : null;
  }

  /** Creates or updates the title and adds `copyCount` physical copies. */
  async addTitleWithCopies(isbn: string, draft: TitleDraft & { avi?: string }, copyCount: number, location = ''): Promise<void> {
    const titleRef = this.school.schoolDoc('titles', isbn);
    const existing = await getDoc(titleRef);
    const batch = writeBatch(this.db);
    if (!existing.exists()) {
      const title: Omit<Title, 'isbn'> = {
        title: draft.title.trim(),
        author: draft.author.trim(),
        coverUrl: draft.coverUrl,
        publisher: draft.publisher,
        year: draft.year,
        avi: (draft.avi ?? '').trim(),
        source: draft.source,
        createdAt: now(),
      };
      batch.set(titleRef, title);
    }
    const copiesRef = this.school.schoolCollection('copies');
    for (let i = 0; i < copyCount; i++) {
      const copy: Omit<Copy, 'id'> = { isbn, location, status: 'available', createdAt: now() };
      batch.set(doc(copiesRef), copy);
    }
    await batch.commit();
  }

  updateTitle(isbn: string, patch: Partial<Pick<Title, 'title' | 'author' | 'avi'>>): Promise<void> {
    return updateDoc(this.school.schoolDoc('titles', isbn), patch);
  }

  setCopyStatus(copyId: string, status: Copy['status']): Promise<void> {
    return updateDoc(this.school.schoolDoc('copies', copyId), { status });
  }

  /**
   * Lends any available copy of `isbn` to `student`. Runs in a transaction so
   * two leesouders scanning the last copy at the same time cannot both win.
   */
  async borrow(isbn: string, student: Student): Promise<Loan> {
    const title = await this.getTitle(isbn);
    if (!title) throw new LibraryError('unknown-title');

    const candidates = await getDocs(
      query(this.school.schoolCollection('copies'), where('isbn', '==', isbn), where('status', '==', 'available'), limit(5)),
    );
    if (candidates.empty) throw new LibraryError('no-copy-available');

    const uid = this.auth.uid() ?? '';
    const loanDays = this.school.school()?.loanDays ?? 21;
    const loanRef = doc(this.school.schoolCollection('loans'));
    const loan: Omit<Loan, 'id'> = {
      copyId: '',
      isbn,
      title: title.title,
      studentId: student.id,
      studentName: studentDisplayName(student),
      group: student.group,
      borrowedAt: today(),
      dueAt: addDays(today(), loanDays),
      returnedAt: null,
      byUid: uid,
    };

    await runTransaction(this.db, async (tx) => {
      for (const candidate of candidates.docs) {
        const fresh = await tx.get(candidate.ref);
        if (fresh.exists() && fresh.data()['status'] === 'available') {
          loan.copyId = fresh.id;
          tx.update(fresh.ref, { status: 'onLoan' });
          tx.set(loanRef, loan);
          return;
        }
      }
      throw new LibraryError('no-copy-available');
    });

    return { ...loan, id: loanRef.id };
  }

  /** Active loans for an ISBN. More than one means several copies are out. */
  async activeLoansForIsbn(isbn: string): Promise<Loan[]> {
    const snap = await getDocs(
      query(this.school.schoolCollection('loans'), where('isbn', '==', isbn), where('returnedAt', '==', null)),
    );
    return snap.docs.map((d) => withId<Loan>(d));
  }

  async returnLoan(loan: Loan): Promise<void> {
    const loanRef = this.school.schoolDoc('loans', loan.id);
    const copyRef = this.school.schoolDoc('copies', loan.copyId);
    await runTransaction(this.db, async (tx) => {
      const fresh = await tx.get(loanRef);
      if (!fresh.exists() || fresh.data()['returnedAt'] !== null) throw new LibraryError('not-on-loan');
      tx.update(loanRef, { returnedAt: today() });
      tx.update(copyRef, { status: 'available' });
    });
  }

  /** Ensures a title document exists (used when a scan finds a title without copies). */
  saveTitle(isbn: string, draft: TitleDraft): Promise<void> {
    return setDoc(this.school.schoolDoc('titles', isbn), { ...draft, avi: '', createdAt: now() }, { merge: true });
  }
}
