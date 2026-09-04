/**
 * All user-facing text, in Dutch. The customer is a leescoördinator or
 * leesouder at a basisschool, so Dutch is the only language for now; when a
 * second language is needed this file becomes the source for Angular i18n.
 */
export const T = {
  appName: 'Biebouders',

  nav: {
    back: 'Terug',
  },

  home: {
    welcome: 'Welkom in de schoolbieb',
    borrow: 'Uitlenen',
    return: 'Innemen',
    add: 'Boek toevoegen',
    remove: 'Boek verwijderen',
    overview: 'Alle boeken',
  },

  fields: {
    isbn: 'ISBN',
    title: 'Titel',
    author: 'Auteur',
    childName: 'Naam leerling',
    group: 'Groep',
    required: 'Dit veld is verplicht',
    invalidIsbn: 'Dit is geen geldig ISBN',
  },

  scanner: {
    scan: 'Scan ISBN met camera',
    scanAgain: 'Opnieuw scannen',
    stop: 'Camera stoppen',
    scannedIsbn: 'Gescand ISBN:',
    noPermission: 'Geef de browser toegang tot de camera om te scannen.',
    noCamera: 'Geen camera gevonden op dit apparaat.',
    failed: 'De camera kon niet worden gestart.',
  },

  add: {
    title: 'Boek toevoegen',
    submit: 'Toevoegen',
    done: (title: string) => `"${title}" is toegevoegd.`,
    duplicate: 'Er staat al een boek met dit ISBN in de bieb.',
    failed: 'Het boek kon niet worden toegevoegd. Probeer het opnieuw.',
  },

  borrow: {
    title: 'Boek uitlenen',
    submit: 'Uitlenen',
    done: (title: string, child: string) => `"${title}" is uitgeleend aan ${child}.`,
    alreadyBorrowed: (child: string) => `Dit boek is al uitgeleend aan ${child}.`,
    failed: 'Het boek kon niet worden uitgeleend. Probeer het opnieuw.',
  },

  return: {
    title: 'Boek innemen',
    submit: 'Innemen',
    done: (title: string, child: string) => `"${title}" is ingenomen van ${child}.`,
    notBorrowed: 'Dit boek staat al in de kast.',
    failed: 'Het boek kon niet worden ingenomen. Probeer het opnieuw.',
  },

  remove: {
    title: 'Boek verwijderen',
    submit: 'Verwijderen',
    confirm: (title: string) => `"${title}" definitief verwijderen uit de bieb?`,
    confirmYes: 'Verwijderen',
    confirmNo: 'Annuleren',
    done: (title: string) => `"${title}" is verwijderd.`,
    failed: 'Het boek kon niet worden verwijderd. Probeer het opnieuw.',
  },

  overview: {
    title: 'Alle boeken',
    empty: 'Er staan nog geen boeken in de bieb.',
    available: 'In de kast',
    borrowedBy: 'Uitgeleend aan',
    group: 'Groep',
    since: 'Sinds',
    loadFailed: 'De boekenlijst kon niet worden geladen.',
  },

  common: {
    notFound: 'Geen boek gevonden met dit ISBN.',
    close: 'Sluiten',
  },
} as const;
