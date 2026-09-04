/**
 * All user-facing text, in Dutch. The customer is a leescoördinator or
 * leesouder at a basisschool, so Dutch is the only language for now; when a
 * second language is needed this file becomes the source for Angular i18n.
 */
export const T = {
  appName: 'Biebouders',
  tagline: 'De schoolbieb op je telefoon',

  nav: {
    borrow: 'Uitlenen',
    return: 'Innemen',
    loans: 'Overzicht',
    books: 'Boeken',
    students: 'Leerlingen',
    settings: 'Instellingen',
    logout: 'Uitloggen',
    login: 'Inloggen',
    register: 'Gratis starten',
    back: 'Terug',
  },

  landing: {
    heroTitle: 'Een schoolbieb zonder scanner, printer of gedoe',
    heroText:
      'Scan het ISBN op de achterkant met je telefoon. Uitlenen en innemen in twee tikken. Voor leesouders, leerkrachten en leescoördinatoren van basisscholen.',
    cta: 'Gratis starten',
    ctaSecondary: 'Bekijk de demo',
    features: [
      {
        title: 'Geen apparatuur nodig',
        text: 'Elk boek heeft al een barcode. Je telefoon of tablet leest hem. Geen etiketten plakken, geen scanner kopen.',
      },
      {
        title: 'Boekgegevens vanzelf',
        text: 'Titel, auteur en omslag worden opgehaald zodra je scant. Alleen het AVI-niveau vul je zelf in als je wilt.',
      },
      {
        title: 'Alleen voornaam en groep',
        text: 'Geen leerlingaccounts, geen geboortedata, geen BSN. Een verwerkersovereenkomst past op één pagina.',
      },
      {
        title: 'Altijd overzicht',
        text: 'Wie heeft wat, sinds wanneer, en wat is te laat. Per groep, per leerling, live op elk apparaat.',
      },
    ],
    howTitle: 'Zo werkt het',
    how: [
      'Maak een account en vul de naam van je school in.',
      'Plak de leerlingenlijst uit ParnasSys, ESIS of Excel.',
      'Scan je boeken. Tien seconden per boek, ook met meerdere ouders tegelijk.',
      'Uitlenen: scan het boek, tik op de naam. Klaar.',
    ],
    pricingTitle: 'Eén prijs, alles inbegrepen',
    priceFree: 'Klassenbieb',
    priceFreeAmount: 'Gratis',
    priceFreeText: 'Tot 150 boeken. Voor één klas of om te proberen.',
    priceSchool: 'Schoolbieb',
    priceSchoolAmount: '€ 149 per jaar',
    priceSchoolText: 'Onbeperkt boeken, locaties en medewerkers. De eerste drie maanden gratis.',
    pricingNote: 'Geen btw (kleineondernemersregeling). Betaling op factuur. Je data kun je altijd exporteren.',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
  },

  auth: {
    loginTitle: 'Inloggen',
    registerTitle: 'Account aanmaken',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    passwordHint: 'Minimaal 8 tekens',
    loginButton: 'Inloggen',
    registerButton: 'Account aanmaken',
    google: 'Doorgaan met Google',
    forgot: 'Wachtwoord vergeten?',
    resetSent: 'We hebben een e-mail gestuurd om je wachtwoord opnieuw in te stellen.',
    noAccount: 'Nog geen account?',
    hasAccount: 'Al een account?',
    toRegister: 'Gratis starten',
    toLogin: 'Inloggen',
    or: 'of',
    errors: {
      invalidCredential: 'E-mailadres of wachtwoord klopt niet.',
      emailInUse: 'Er bestaat al een account met dit e-mailadres.',
      weakPassword: 'Kies een wachtwoord van minimaal 8 tekens.',
      invalidEmail: 'Dit is geen geldig e-mailadres.',
      popupClosed: 'Het Google-venster is gesloten voordat je was ingelogd.',
      generic: 'Inloggen is niet gelukt. Probeer het opnieuw.',
    },
  },

  onboarding: {
    title: 'Welkom bij Biebouders',
    intro: 'Maak een nieuwe schoolbieb aan, of sluit je aan bij een school die al met Biebouders werkt.',
    createTitle: 'Nieuwe school',
    schoolName: 'Naam van de school',
    createButton: 'Schoolbieb aanmaken',
    joinTitle: 'Aansluiten bij een school',
    joinText: 'Vraag de beheerder van de schoolbieb om de toegangscode. Die staat bij Instellingen.',
    joinCode: 'Toegangscode',
    joinButton: 'Aansluiten',
    unknownCode: 'Deze toegangscode bestaat niet. Controleer de code bij de beheerder.',
    alreadyMember: 'Je bent al lid van deze school.',
    failed: 'Dat is niet gelukt. Probeer het opnieuw.',
  },

  fields: {
    isbn: 'ISBN',
    title: 'Titel',
    author: 'Auteur',
    avi: 'AVI-niveau',
    copies: 'Aantal exemplaren',
    location: 'Locatie (optioneel)',
    firstName: 'Voornaam',
    lastName: 'Achternaam (optioneel)',
    group: 'Groep',
    search: 'Zoeken',
    required: 'Dit veld is verplicht',
    invalidIsbn: 'Dit is geen geldig ISBN',
    min1: 'Minimaal 1',
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

  borrow: {
    title: 'Uitlenen',
    step1: 'Scan of typ het ISBN',
    step2: 'Kies de leerling',
    lookup: 'Zoek boek',
    unknownTitle: 'Dit boek staat nog niet in de bieb.',
    addIt: 'Boek toevoegen',
    noCopy: 'Alle exemplaren van dit boek zijn uitgeleend.',
    availableCopies: (n: number) => (n === 1 ? '1 exemplaar beschikbaar' : `${n} exemplaren beschikbaar`),
    allGroups: 'Alle groepen',
    noStudents: 'Geen leerlingen gevonden. Voeg leerlingen toe bij Leerlingen.',
    done: (title: string, child: string, due: string) => `"${title}" is uitgeleend aan ${child}, terug op ${due}.`,
    failed: 'Uitlenen is niet gelukt. Probeer het opnieuw.',
    other: 'Ander boek',
  },

  return: {
    title: 'Innemen',
    step1: 'Scan of typ het ISBN van het boek dat terugkomt',
    notOnLoan: 'Dit boek is niet uitgeleend.',
    chooseLoan: 'Er zijn meerdere exemplaren uitgeleend. Welk exemplaar komt terug?',
    done: (title: string, child: string) => `"${title}" is ingenomen van ${child}.`,
    failed: 'Innemen is niet gelukt. Probeer het opnieuw.',
    button: 'Innemen',
  },

  loans: {
    title: 'Uitgeleende boeken',
    empty: 'Er is op dit moment niets uitgeleend.',
    overdue: 'Te laat',
    dueOn: 'Terug op',
    since: 'Sinds',
    returnButton: 'Innemen',
    allGroups: 'Alle groepen',
    count: (n: number) => (n === 1 ? '1 boek uitgeleend' : `${n} boeken uitgeleend`),
    overdueCount: (n: number) => (n === 1 ? '1 te laat' : `${n} te laat`),
  },

  books: {
    title: 'Boeken',
    add: 'Boek toevoegen',
    empty: 'Nog geen boeken. Scan het eerste boek om te beginnen.',
    noResults: 'Geen boeken gevonden.',
    copies: (total: number, available: number) =>
      total === 1 ? (available === 1 ? '1 exemplaar, in de kast' : '1 exemplaar, uitgeleend') : `${total} exemplaren, ${available} in de kast`,
    addCopy: 'Exemplaar erbij',
    markLost: 'Exemplaar kwijt',
    markRemoved: 'Exemplaar afvoeren',
    copyStatus: {
      available: 'In de kast',
      onLoan: 'Uitgeleend',
      lost: 'Kwijt',
      removed: 'Afgevoerd',
    } as Record<string, string>,
    saved: 'Opgeslagen.',
  },

  addBook: {
    title: 'Boek toevoegen',
    step1: 'Scan of typ het ISBN',
    lookingUp: 'Boekgegevens ophalen…',
    found: 'Gevonden. Controleer en pas aan waar nodig.',
    notFound: 'Geen gegevens gevonden voor dit ISBN. Vul titel en auteur zelf in.',
    alreadyHave: (n: number) =>
      n === 1 ? 'Dit boek staat al in de bieb met 1 exemplaar.' : `Dit boek staat al in de bieb met ${n} exemplaren.`,
    submit: 'Toevoegen',
    done: (title: string, n: number) => (n === 1 ? `"${title}" is toegevoegd.` : `"${title}" is toegevoegd (${n} exemplaren).`),
    failed: 'Toevoegen is niet gelukt. Probeer het opnieuw.',
    another: 'Volgend boek',
  },

  students: {
    title: 'Leerlingen',
    add: 'Leerling toevoegen',
    import: 'Lijst importeren',
    importHelp:
      'Plak hier de leerlingenlijst uit ParnasSys, ESIS of Excel (kolommen voornaam, achternaam, groep), of kies een CSV-bestand.',
    importFile: 'Bestand kiezen',
    importPreview: (n: number) => (n === 1 ? '1 leerling gevonden' : `${n} leerlingen gevonden`),
    importButton: 'Importeren',
    imported: (n: number) => (n === 1 ? '1 leerling toegevoegd.' : `${n} leerlingen toegevoegd.`),
    importedNone: 'Geen nieuwe leerlingen: ze stonden er allemaal al in.',
    empty: 'Nog geen leerlingen. Voeg ze toe of importeer een lijst.',
    added: (name: string) => `${name} is toegevoegd.`,
    deactivate: 'Van school',
    remove: 'Verwijderen',
    confirmRemove: (name: string) => `${name} verwijderen? Uitleengeschiedenis blijft bewaard.`,
    failed: 'Opslaan is niet gelukt. Probeer het opnieuw.',
    countInGroup: (n: number) => (n === 1 ? '1 leerling' : `${n} leerlingen`),
  },

  settings: {
    title: 'Instellingen',
    school: 'School',
    schoolName: 'Naam van de school',
    loanDays: 'Uitleentermijn (dagen)',
    groups: 'Groepen',
    groupsHint: 'Gescheiden door komma’s, van laag naar hoog. Bijvoorbeeld: 1/2A, 1/2B, 3, 4, 5, 6, 7, 8',
    save: 'Opslaan',
    saved: 'Instellingen opgeslagen.',
    team: 'Medewerkers',
    joinCode: 'Toegangscode voor collega’s',
    joinCodeHelp: 'Collega’s maken een account aan en vullen deze code in om bij deze school te horen.',
    copy: 'Kopiëren',
    copied: 'Gekopieerd.',
    roles: { beheerder: 'Beheerder', medewerker: 'Medewerker' } as Record<string, string>,
    newYear: 'Nieuw schooljaar',
    newYearText: 'Schuift alle leerlingen één groep door. Leerlingen uit de hoogste groep gaan van school.',
    newYearButton: 'Groepen doorschuiven',
    newYearConfirm: 'Alle leerlingen één groep doorschuiven? Dit kun je niet ongedaan maken.',
    newYearDone: (promoted: number, left: number) => `${promoted} leerlingen doorgeschoven, ${left} van school.`,
    plan: { free: 'Gratis (klassenbieb)', trial: 'Proefperiode', paid: 'Schoolbieb' } as Record<string, string>,
    logout: 'Uitloggen',
  },

  privacy: {
    title: 'Privacy',
    text: [
      'Biebouders verwerkt zo min mogelijk persoonsgegevens. Van leerlingen slaan we alleen de voornaam, eventueel de achternaam en de groep op, plus welke boeken zij geleend hebben. Geen geboortedata, geen BSN, geen e-mailadressen van kinderen.',
      'Van medewerkers slaan we het e-mailadres op waarmee zij inloggen.',
      'Gegevens staan bij Google Cloud (Firebase) in de Europese Unie. De school is verwerkingsverantwoordelijke; Biebouders is verwerker. Een verwerkersovereenkomst is op aanvraag beschikbaar.',
      'Je kunt alle gegevens van je school op elk moment exporteren en laten verwijderen.',
    ],
  },

  common: {
    close: 'Sluiten',
    cancel: 'Annuleren',
    confirm: 'Bevestigen',
    loading: 'Laden…',
    today: 'vandaag',
    genericError: 'Er ging iets mis. Probeer het opnieuw.',
  },
} as const;

/** dd-mm-yyyy, the way Dutch schools write dates. */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}
