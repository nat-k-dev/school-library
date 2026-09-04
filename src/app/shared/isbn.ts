/**
 * ISBN helpers. Books carry an EAN-13 barcode that *is* the ISBN-13, so the
 * scanner and the manual input both end up here.
 */

/** Strips dashes, spaces and an optional "ISBN" prefix; uppercases the X check digit. */
export function normalizeIsbn(raw: string): string {
  return raw.replace(/^\s*isbn[-:\s]*/i, '').replace(/[\s-]/g, '').toUpperCase();
}

export function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const digits = isbn.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
}

export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const sum = isbn
    .split('')
    .map((c) => (c === 'X' ? 10 : Number(c)))
    .reduce((acc, d, i) => acc + d * (10 - i), 0);
  return sum % 11 === 0;
}

/** Converts a valid ISBN-10 to ISBN-13 (978 prefix). Returns null for invalid input. */
export function isbn10To13(isbn10: string): string | null {
  if (!isValidIsbn10(isbn10)) return null;
  const core = '978' + isbn10.slice(0, 9);
  const sum = core.split('').map(Number).reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return core + ((10 - (sum % 10)) % 10);
}

/**
 * Accepts whatever a person typed or a scanner produced and returns a clean
 * ISBN-13, or null when it is not a valid ISBN at all.
 */
export function toIsbn13(raw: string): string | null {
  const isbn = normalizeIsbn(raw);
  if (isValidIsbn13(isbn)) return isbn;
  if (isValidIsbn10(isbn)) return isbn10To13(isbn);
  return null;
}

/**
 * Books without a barcode (old, home-made, donated without cover) get a
 * school-internal EAN-13 in the GS1 "restricted circulation" range starting
 * with 20. The camera scanner reads it like any ISBN, and the checksum keeps
 * typos out.
 */
const INTERNAL_PREFIX = '200';

export function makeInternalCode(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999_999_999) throw new Error('sequence out of range');
  const core = INTERNAL_PREFIX + String(sequence).padStart(9, '0');
  const sum = core.split('').map(Number).reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return core + ((10 - (sum % 10)) % 10);
}

export function isInternalCode(code: string): boolean {
  return code.startsWith(INTERNAL_PREFIX) && isValidIsbn13(code);
}
