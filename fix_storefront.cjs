const fs = require('fs');

let content = fs.readFileSync('src/services/storefrontApi.ts', 'utf8');

// Replace res.error?.message with res.message
content = content.replace(/res\.error\?\.message/g, 'res.message');

// Replace !res.success with res.status === 'error'
content = content.replace(/!res\.success/g, "res.status === 'error'");

fs.writeFileSync('src/services/storefrontApi.ts', content);

