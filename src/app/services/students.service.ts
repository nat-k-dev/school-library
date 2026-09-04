import { Injectable, NgZone, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Firestore, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { of, switchMap } from 'rxjs';
import { SchoolService } from '../core/school.service';
import { chunk, collectionChanges } from '../core/firestore.util';
import { Student, now, studentDisplayName } from '../shared/models';

export type NewStudent = Pick<Student, 'firstName' | 'lastName' | 'group'>;

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly db = inject(Firestore);
  private readonly zone = inject(NgZone);
  private readonly school = inject(SchoolService);

  /** Live list of all students of the current school; `undefined` while loading. */
  readonly students = toSignal(
    toObservable(this.school.schoolId).pipe(
      switchMap((id) =>
        id ? collectionChanges<Student>(this.zone, this.school.schoolCollection('students')) : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  readonly activeStudents = computed(() =>
    (this.students() ?? [])
      .filter((s) => s.active)
      .sort((a, b) => a.group.localeCompare(b.group, 'nl', { numeric: true }) || a.firstName.localeCompare(b.firstName, 'nl')),
  );

  async add(student: NewStudent): Promise<string> {
    const ref = await addDoc(this.school.schoolCollection('students'), {
      ...clean(student),
      active: true,
      createdAt: now(),
    });
    return ref.id;
  }

  update(id: string, patch: Partial<NewStudent & Pick<Student, 'active'>>): Promise<void> {
    return updateDoc(this.school.schoolDoc('students', id), patch);
  }

  remove(id: string): Promise<void> {
    return deleteDoc(this.school.schoolDoc('students', id));
  }

  /**
   * Bulk import. Students already present (same name and group) are skipped
   * so the same export can be imported twice without duplicates.
   * Returns how many were added.
   */
  async importMany(rows: NewStudent[]): Promise<number> {
    const existing = new Set((this.students() ?? []).map(key));
    const fresh = rows.map(clean).filter((r) => r.firstName && !existing.has(key(r)));
    const collectionRef = this.school.schoolCollection('students');
    for (const part of chunk(fresh)) {
      const batch = writeBatch(this.db);
      for (const row of part) batch.set(doc(collectionRef), { ...row, active: true, createdAt: now() });
      await batch.commit();
    }
    return fresh.length;
  }

  /** Moves every active student one group up; group 8 leaves the school. */
  async promoteAll(groups: string[]): Promise<{ promoted: number; left: number }> {
    const students = this.activeStudents();
    let promoted = 0;
    let left = 0;
    for (const part of chunk(students)) {
      const batch = writeBatch(this.db);
      for (const s of part) {
        const index = groups.indexOf(s.group);
        const next = index >= 0 ? groups[index + 1] : undefined;
        if (next) {
          batch.update(this.school.schoolDoc('students', s.id), { group: next });
          promoted++;
        } else if (index === groups.length - 1) {
          batch.update(this.school.schoolDoc('students', s.id), { active: false });
          left++;
        }
      }
      await batch.commit();
    }
    return { promoted, left };
  }
}

function clean(s: NewStudent): NewStudent {
  return { firstName: s.firstName.trim(), lastName: (s.lastName ?? '').trim(), group: s.group.trim() };
}

function key(s: NewStudent): string {
  return `${studentDisplayName(s).toLowerCase()}|${s.group.toLowerCase()}`;
}
