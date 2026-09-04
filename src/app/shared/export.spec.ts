import { toCsv } from './export';

describe('toCsv', () => {
  it('writes a semicolon-separated table with CRLF line endings', () => {
    const csv = toCsv(
      [
        { name: 'Sem', group: '5' },
        { name: 'Noor', group: '3' },
      ],
      [
        { header: 'Voornaam', value: (r) => r.name },
        { header: 'Groep', value: (r) => r.group },
      ],
    );
    expect(csv).toBe('Voornaam;Groep\r\nSem;5\r\nNoor;3\r\n');
  });

  it('quotes values containing separators, quotes or line breaks', () => {
    const csv = toCsv([{ t: 'Jip; Janneke', a: 'Annie "M.G." Schmidt', n: null }], [
      { header: 't', value: (r) => r.t },
      { header: 'a', value: (r) => r.a },
      { header: 'n', value: (r) => r.n },
    ]);
    expect(csv).toBe('t;a;n\r\n"Jip; Janneke";"Annie ""M.G."" Schmidt";\r\n');
  });
});
