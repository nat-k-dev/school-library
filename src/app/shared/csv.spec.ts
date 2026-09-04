import { parseStudentCsv } from './csv';

describe('parseStudentCsv', () => {
  it('reads a ParnasSys-style export with Dutch headers and semicolons', () => {
    const text = 'Voornaam;Achternaam;Groep\nSem;de Vries;5\nNoor;Jansen;Groep 3\n';
    expect(parseStudentCsv(text)).toEqual([
      { firstName: 'Sem', lastName: 'de Vries', group: '5' },
      { firstName: 'Noor', lastName: 'Jansen', group: '3' },
    ]);
  });

  it('reads tab-separated text pasted from Excel without a header', () => {
    const text = 'Sem\tde Vries\t5\nNoor\tJansen\t3';
    expect(parseStudentCsv(text)).toEqual([
      { firstName: 'Sem', lastName: 'de Vries', group: '5' },
      { firstName: 'Noor', lastName: 'Jansen', group: '3' },
    ]);
  });

  it('handles reordered columns, quotes and missing last names', () => {
    const text = 'Groep,Roepnaam\n"1/2A","Liv"\n4,"Mees, jr."\n';
    expect(parseStudentCsv(text)).toEqual([
      { firstName: 'Liv', lastName: '', group: '1/2A' },
      { firstName: 'Mees, jr.', lastName: '', group: '4' },
    ]);
  });

  it('skips rows without a name or group', () => {
    const text = 'Voornaam;Groep\n;5\nSem;\nNoor;6';
    expect(parseStudentCsv(text)).toEqual([{ firstName: 'Noor', lastName: '', group: '6' }]);
  });

  it('returns nothing for empty input', () => {
    expect(parseStudentCsv('')).toEqual([]);
    expect(parseStudentCsv('\n\n')).toEqual([]);
  });
});
