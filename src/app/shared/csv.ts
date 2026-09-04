/**
 * Parses a student list pasted or uploaded from ParnasSys, ESIS or Excel.
 * Accepts `;`, `,` or tab as delimiter and recognises Dutch and English
 * column headers. Without a header row, columns are taken as
 * voornaam, achternaam, groep.
 */
export interface StudentRow {
  firstName: string;
  lastName: string;
  group: string;
}

const HEADERS: Record<keyof StudentRow, string[]> = {
  firstName: ['voornaam', 'roepnaam', 'firstname', 'first name', 'naam'],
  lastName: ['achternaam', 'lastname', 'last name', 'surname'],
  group: ['groep', 'group', 'klas', 'class'],
};

export function parseStudentCsv(text: string): StudentRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const rows = lines.map((l) => splitLine(l, delimiter));
  const mapping = detectHeader(rows[0]);
  const dataRows = mapping ? rows.slice(1) : rows;
  const columns = mapping ?? { firstName: 0, lastName: 1, group: 2 };

  return dataRows
    .map((cells) => ({
      firstName: cells[columns.firstName] ?? '',
      lastName: columns.lastName >= 0 ? (cells[columns.lastName] ?? '') : '',
      group: cells[columns.group] ?? '',
    }))
    .map((r) => ({ firstName: r.firstName.trim(), lastName: r.lastName.trim(), group: normaliseGroup(r.group) }))
    .filter((r) => r.firstName !== '' && r.group !== '');
}

function detectDelimiter(line: string): string {
  const counts: [string, number][] = [
    ['\t', (line.match(/\t/g) ?? []).length],
    [';', (line.match(/;/g) ?? []).length],
    [',', (line.match(/,/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ';';
}

function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (c === delimiter && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function detectHeader(cells: string[]): Record<keyof StudentRow, number> | null {
  const lower = cells.map((c) => c.toLowerCase());
  const find = (names: string[]) => lower.findIndex((c) => names.includes(c));
  const firstName = find(HEADERS.firstName);
  const group = find(HEADERS.group);
  if (firstName < 0 || group < 0) return null;
  return { firstName, lastName: find(HEADERS.lastName), group };
}

/** "Groep 5" → "5", "5a" → "5A". */
function normaliseGroup(raw: string): string {
  return raw
    .replace(/^groep\s*/i, '')
    .trim()
    .toUpperCase();
}
