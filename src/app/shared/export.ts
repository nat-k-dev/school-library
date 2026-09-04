/**
 * CSV export the way Dutch Excel expects it: semicolon-separated, UTF-8 with
 * a byte-order mark so accents survive, CRLF line endings.
 */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const lines = [columns.map((c) => escape(c.header)).join(';')];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(c.value(row))).join(';'));
  }
  return lines.join('\r\n') + '\r\n';
}

function escape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Triggers a browser download of `text` as a CSV file. */
export function downloadCsv(filename: string, text: string): void {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
