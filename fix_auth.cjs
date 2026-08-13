const fs = require('fs');
let content = fs.readFileSync('src/services/authService.ts', 'utf8');
content = content.replace(/result\.message\?\.message/g, 'result.message');
fs.writeFileSync('src/services/authService.ts', content);
