const fs = require('fs');

fs.readFile('env.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('✅' , data);
  });

console.log('INJECT_ENV1:', process.env.NG_APP_FIREBASE_AUTH_DOMAIN);
console.log('INJECT_ENV2:', process.env.NG_APP_FIREBASE_PROJECT_ID);

const envProdPath = 'env.ts';

const content = `
export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.NG_APP_FIREBASE_API_KEY}',
    authDomain: '${process.env.NG_APP_FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.NG_APP_FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.NG_APP_FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.NG_APP_FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.NG_APP_FIREBASE_APP_ID}',
  }
};
`;

fs.writeFileSync(envProdPath, content);
console.log('✅ Firebase config injected into env.ts');
