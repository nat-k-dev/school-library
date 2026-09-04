import { NewStudent } from '../services/students.service';
import { TitleDraft } from './models';

/**
 * Sample data a new school can load to click around before scanning its
 * own books. Titles are well-known Dutch children's books; the ISBNs are
 * checksum-valid placeholders, not necessarily the real editions.
 */
export const DEMO_STUDENTS: NewStudent[] = [
  { firstName: 'Liv', lastName: '', group: '3' },
  { firstName: 'Mees', lastName: 'Bakker', group: '3' },
  { firstName: 'Saar', lastName: '', group: '3' },
  { firstName: 'Noor', lastName: 'Jansen', group: '5' },
  { firstName: 'Sem', lastName: 'de Vries', group: '5' },
  { firstName: 'Daan', lastName: '', group: '5' },
  { firstName: 'Fenna', lastName: '', group: '5' },
  { firstName: 'Lucas', lastName: 'Visser', group: '7' },
  { firstName: 'Julia', lastName: '', group: '7' },
  { firstName: 'Milan', lastName: '', group: '7' },
  { firstName: 'Tess', lastName: 'Smit', group: '7' },
  { firstName: 'Finn', lastName: '', group: '7' },
];

export const DEMO_TITLES: { isbn: string; draft: TitleDraft & { avi: string }; copies: number }[] = [
  { isbn: '9789029540056', copies: 2, draft: manual('Jip en Janneke', 'Annie M.G. Schmidt', 'M3') },
  { isbn: '9789025542108', copies: 1, draft: manual('Dolfje Weerwolfje', 'Paul van Loon', 'E4') },
  { isbn: '9789056371593', copies: 2, draft: manual('De Gruffalo', 'Julia Donaldson', 'M4') },
  { isbn: '9789045111247', copies: 1, draft: manual('Pluk van de Petteflet', 'Annie M.G. Schmidt', 'E4') },
  { isbn: '9789025824709', copies: 1, draft: manual('Kikker is Kikker', 'Max Velthuijs', 'M3') },
  { isbn: '9789021691114', copies: 1, draft: manual('Mees Kees op de kast', 'Mirjam Oldenhave', 'E5') },
  { isbn: '9789401808002', copies: 2, draft: manual('De waanzinnige boomhut van 13 verdiepingen', 'Andy Griffiths', 'M6') },
  { isbn: '9789026112218', copies: 1, draft: manual('Het leven van een loser', 'Jeff Kinney', 'E6') },
];

function manual(title: string, author: string, avi: string): TitleDraft & { avi: string } {
  return { title, author, avi, coverUrl: null, publisher: '', year: '', source: 'manual' };
}
