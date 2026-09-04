# Biebouders

Uitleensysteem voor de schoolbieb: boeken toevoegen, uitlenen en innemen door het
ISBN op de achterkant te scannen met de camera van een telefoon of tablet.

Angular 22 · Angular Material · Tailwind 4 · Firebase Firestore · ZXing.

## Development

```bash
npm ci
cp .env.example .env      # fill in the Firebase web config
npm run env:local         # writes injected-environment.ts (gitignored)
npm start                 # http://localhost:4200
```

## Checks

```bash
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

The same three steps run in GitHub Actions on every push and pull request.

## Layout

```
src/app/
  components/   one folder per screen
  services/     BooksService (Firestore), SnackBarService
  shared/       models, ISBN helpers, Dutch UI strings (nl.ts),
                camera ScannerComponent, ConfirmDialogComponent
```

All user-facing text lives in `src/app/shared/nl.ts`.

## Deployment

Netlify builds `main`. The Firebase web config is read from the
`NG_APP_FIREBASE_*` environment variables by `inject-env.js` at build time.
