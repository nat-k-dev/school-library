# Biebouders

Uitleensysteem voor de schoolbieb van een basisschool. Leesouders en
leerkrachten scannen het ISBN op de achterkant met de camera van een telefoon
of tablet; uitlenen en innemen kost twee tikken. Elke school is een eigen
tenant; van leerlingen worden alleen voornaam en groep opgeslagen.

Angular 22 · Angular Material · Tailwind 4 · Firebase Auth + Firestore · ZXing.

## Development

```bash
npm ci
cp .env.example .env      # fill in the Firebase web config
npm run env:local         # writes injected-environment.ts (gitignored)
npm start                 # http://localhost:4200
```

### Against the local Firebase emulators (recommended while developing)

Needs Java 17+ and the Firebase CLI (`npm i -g firebase-tools`).

```bash
# .env: NG_APP_USE_EMULATORS=true, then
npm run env:local
npm run emulators         # Auth on :9099, Firestore on :8080, UI on :4000
npm start
```

Emulator data is in-memory and gone after a restart. Registration, school
creation, join codes and the security rules all work exactly as in production.

## Checks

```bash
npm run lint
npm run test:ci
npm run build
```

The same three steps run in GitHub Actions on every push and pull request.

## Firebase project setup (one-time)

1. Create a Firebase project; pick the Firestore location `europe-west4`
   (Netherlands) when enabling Firestore.
2. Authentication → Sign-in method: enable **Email/Password** and **Google**.
3. Deploy the security rules: `firebase deploy --only firestore:rules`
   (set the project id in `.firebaserc` first).
4. Copy the web app config into `.env` (and into the Netlify environment).
5. Optional: a Google Books API key in `NG_APP_GOOGLE_BOOKS_KEY` improves ISBN
   lookups. Without it only Open Library is queried.

## Subscriptions

There is no payment flow. A school starts with a 90-day trial of the full
product; afterwards it stays free while it has at most 150 copies, and becomes
read-only above that until it pays. The school asks for an invoice from
Instellingen (a mailto link). After payment, edit the school document by hand
in the Firestore console:

```
plan: "paid"
paidUntil: "2027-09-01"      # yyyy-mm-dd
```

The security rules stop the app from changing `plan`, `trialEndsAt` and
`paidUntil`. The read-only state is enforced in the UI only (see
`src/app/shared/plan.ts`), which is fine for a paying-customer relationship.

## Books without a barcode

Boek toevoegen → "Geen barcode?" reserves a school-internal EAN-13 code
(prefix 200, valid checksum) that the camera reads like an ISBN. Boeken →
Etiketten prints them on 3 × 8 label sheets (Avery L7160).

## Layout

```
src/app/
  core/         AuthService, SchoolService (current tenant), auth guard, Firestore helpers
  services/     StudentsService, LibraryService (titles, copies, loans), IsbnLookupService
  features/
    public/     landing, login, register, privacy
    app/        shell + onboarding, uitlenen, innemen, overzicht, boeken (+ nieuw, etiketten),
                leerlingen, instellingen (abonnement, export, team, nieuw schooljaar)
  shared/       models, ISBN helpers, CSV parser, Dutch UI strings (nl.ts),
                camera ScannerComponent, ConfirmDialogComponent
firestore.rules  tenant isolation: only members of a school can read or write its data
```

All user-facing text lives in `src/app/shared/nl.ts`.

## Data model

```
users/{uid}                 email, schoolIds[]
joinCodes/{code}            schoolId
schools/{id}                name, plan, trialEndsAt, paidUntil, copyCount, nextInternalCode,
                            loanDays, groups[], joinCode, createdBy
  members/{uid}             role: beheerder | medewerker
  students/{id}             firstName, lastName, group, active
  titles/{isbn}             title, author, coverUrl, avi, source
  copies/{id}               isbn, location, status: available | onLoan | lost | removed
  loans/{id}                copyId, isbn, title, studentId, studentName, group,
                            borrowedAt, dueAt, returnedAt (null while out)
```

Loans are never deleted; they are the reading history.

## Deployment

Netlify builds `main`. The Firebase web config is read from the
`NG_APP_FIREBASE_*` environment variables by `inject-env.js` at build time.

## TODO

Needs the Firebase Blaze plan (Cloud Functions), so parked until the first
paying school:

- [ ] Server-side ISBN lookup proxy for the KB (jsru.kb.nl, no CORS) with a
      shared `isbnCache/{isbn}` collection.
- [ ] Nightly reset of a public demo school.

No backend needed:

- [ ] Kiosk mode for children on a tablet (group → name → scan).
- [ ] AVI filter "boeken voor mij" and per-group statistics.
- [ ] Mollie (iDEAL) once there are more than ~10 schools.
