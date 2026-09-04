import { isbn10To13, isValidIsbn10, isValidIsbn13, normalizeIsbn, toIsbn13 } from './isbn';

describe('isbn', () => {
  describe('normalizeIsbn', () => {
    it('strips dashes, spaces and an ISBN prefix', () => {
      expect(normalizeIsbn('ISBN 978-90-00-03555-5')).toBe('9789000035555');
      expect(normalizeIsbn(' 90 00 03555 x ')).toBe('900003555X');
    });
  });

  describe('isValidIsbn13', () => {
    it('accepts a real Dutch children\'s book ISBN', () => {
      // Jip en Janneke, Querido
      expect(isValidIsbn13('9789045110264')).toBeTrue();
      // Dolfje Weerwolfje, Leopold
      expect(isValidIsbn13('9789025842932')).toBeTrue();
    });

    it('rejects a wrong check digit', () => {
      expect(isValidIsbn13('9789045110265')).toBeFalse();
    });

    it('rejects anything that is not 13 digits', () => {
      expect(isValidIsbn13('978904511026')).toBeFalse();
      expect(isValidIsbn13('97890451102645')).toBeFalse();
      expect(isValidIsbn13('')).toBeFalse();
      expect(isValidIsbn13('abc')).toBeFalse();
    });
  });

  describe('isValidIsbn10', () => {
    it('accepts valid ISBN-10s, including X check digits', () => {
      expect(isValidIsbn10('0306406152')).toBeTrue();
      expect(isValidIsbn10('080442957X')).toBeTrue();
    });

    it('rejects invalid ISBN-10s', () => {
      expect(isValidIsbn10('0306406153')).toBeFalse();
      expect(isValidIsbn10('030640615')).toBeFalse();
    });
  });

  describe('isbn10To13', () => {
    it('converts with a recomputed check digit', () => {
      expect(isbn10To13('0306406152')).toBe('9780306406157');
      expect(isbn10To13('080442957X')).toBe('9780804429573');
    });

    it('returns null for invalid input', () => {
      expect(isbn10To13('0306406153')).toBeNull();
    });
  });

  describe('toIsbn13', () => {
    it('returns a clean ISBN-13 for typed, dashed and ISBN-10 input', () => {
      expect(toIsbn13('978-90-451-1026-4')).toBe('9789045110264');
      expect(toIsbn13('9789045110264')).toBe('9789045110264');
      expect(toIsbn13('0-306-40615-2')).toBe('9780306406157');
    });

    it('returns null for garbage', () => {
      expect(toIsbn13('')).toBeNull();
      expect(toIsbn13('1234')).toBeNull();
      expect(toIsbn13('9789045110265')).toBeNull();
    });
  });
});
