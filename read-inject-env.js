const fs = require('fs');

fs.readFile('injected-environment.ts', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('✅✅✅' , data);
  });


console.log('✅ Read injected-environment.ts');
