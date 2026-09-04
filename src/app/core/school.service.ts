import { Injectable, NgZone, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { JoinCode, Member, School, UserProfile, now } from '../shared/models';
import { AuthService } from './auth.service';
import { documentChanges } from './firestore.util';

export class JoinError extends Error {
  constructor(readonly code: 'unknown-code' | 'already-member') {
    super(code);
    this.name = 'JoinError';
  }
}

const DEFAULT_GROUPS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const DEFAULT_LOAN_DAYS = 21;

/**
 * Holds the signed-in user's current school (the tenant) and membership.
 * Every data service reads `schoolId()` from here.
 */
@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly db = inject(Firestore);
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthService);

  /** `undefined` while loading; `null` when the user belongs to no school yet. */
  readonly school = signal<School | null | undefined>(undefined);
  readonly member = signal<Member | null>(null);
  readonly schoolId = computed(() => this.school()?.id ?? null);
  readonly isAdmin = computed(() => this.member()?.role === 'beheerder');
  readonly ready = computed(() => this.school() !== undefined);

  private subscriptions: Subscription[] = [];

  constructor() {
    // Keyed on the uid string, not the User object: Firebase hands out a new
    // User reference on token refreshes, which must not re-run this.
    effect(() => {
      const uid = this.auth.uid();
      untracked(() => this.follow(uid));
    });
  }

  /** Creates a school with the current user as beheerder. Returns the school id. */
  async createSchool(name: string): Promise<string> {
    const user = this.requireUser();
    const schoolRef = doc(collection(this.db, 'schools'));
    const joinCode = generateJoinCode();
    const school: Omit<School, 'id'> = {
      name: name.trim(),
      plan: 'free',
      trialEndsAt: null,
      loanDays: DEFAULT_LOAN_DAYS,
      groups: DEFAULT_GROUPS,
      joinCode,
      createdAt: now(),
      createdBy: user.uid,
    };
    const member: Omit<Member, 'uid'> = {
      role: 'beheerder',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      addedAt: now(),
    };

    const batch = writeBatch(this.db);
    batch.set(schoolRef, school);
    batch.set(doc(schoolRef, 'members', user.uid), member);
    batch.set(doc(this.db, 'joinCodes', joinCode), { schoolId: schoolRef.id } satisfies JoinCode);
    batch.set(this.profileRef(user.uid), this.profileFor(user.uid, user.email, schoolRef.id));
    await batch.commit();

    this.follow(user.uid);
    return schoolRef.id;
  }

  /** Attaches the current user to an existing school as medewerker. */
  async joinSchool(rawCode: string): Promise<string> {
    const user = this.requireUser();
    const code = rawCode.trim().toUpperCase();
    const codeSnap = await getDoc(doc(this.db, 'joinCodes', code));
    if (!codeSnap.exists()) throw new JoinError('unknown-code');
    const { schoolId } = codeSnap.data() as JoinCode;

    const profileSnap = await getDoc(this.profileRef(user.uid));
    const existing = profileSnap.exists() ? (profileSnap.data() as UserProfile).schoolIds : [];
    if (existing.includes(schoolId)) throw new JoinError('already-member');

    const member = {
      role: 'medewerker',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      addedAt: now(),
      joinCode: code, // checked by the security rules, harmless to keep
    };
    const batch = writeBatch(this.db);
    batch.set(doc(this.db, 'schools', schoolId, 'members', user.uid), member);
    batch.set(this.profileRef(user.uid), this.profileFor(user.uid, user.email, schoolId, existing));
    await batch.commit();

    this.follow(user.uid);
    return schoolId;
  }

  updateSchool(patch: Partial<Pick<School, 'name' | 'loanDays' | 'groups'>>): Promise<void> {
    const id = this.requireSchoolId();
    return updateDoc(doc(this.db, 'schools', id), patch);
  }

  /** Path helper for the data services. */
  schoolCollection(name: string): CollectionReference {
    return collection(this.db, 'schools', this.requireSchoolId(), name);
  }

  schoolDoc(name: string, id: string): DocumentReference {
    return doc(this.db, 'schools', this.requireSchoolId(), name, id);
  }

  requireSchoolId(): string {
    const id = this.schoolId();
    if (!id) throw new Error('No school selected');
    return id;
  }

  private requireUser() {
    const user = this.auth.user();
    if (!user) throw new Error('Not signed in');
    return user;
  }

  private profileRef(uid: string) {
    return doc(this.db, 'users', uid);
  }

  private profileFor(uid: string, email: string | null, schoolId: string, existing: string[] = []): UserProfile {
    return { uid, email: email ?? '', schoolIds: [...existing, schoolId], createdAt: now() };
  }

  /** (Re)subscribes to the user's first school and their membership in it. */
  private async follow(uid: string | null): Promise<void> {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
    this.member.set(null);

    if (!uid) {
      this.school.set(this.auth.ready() ? null : undefined);
      return;
    }
    this.school.set(undefined);

    const profileSnap = await getDoc(this.profileRef(uid));
    const schoolId = profileSnap.exists() ? (profileSnap.data() as UserProfile).schoolIds[0] : undefined;
    if (!schoolId) {
      this.school.set(null);
      return;
    }

    this.subscriptions.push(
      documentChanges<School>(this.zone, doc(this.db, 'schools', schoolId)).subscribe((school) =>
        this.school.set(school),
      ),
      documentChanges<Member>(this.zone, doc(this.db, 'schools', schoolId, 'members', uid), 'uid').subscribe(
        (member) => this.member.set(member),
      ),
    );
  }
}

/** Six characters, no ambiguous ones (0/O, 1/I). */
function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
