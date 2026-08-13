const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.ts') && f !== 'storefrontApi.ts');

for (const file of files) {
  let p = path.join(servicesDir, file);
  let content = fs.readFileSync(p, 'utf8');

  // Fix unwrapped.message?.message
  content = content.replace(/unwrapped\.message\?\.message/g, 'unwrapped.message');
  
  // Fix unwrapped.message || { message: ... }
  content = content.replace(/message:\s*unwrapped\.message \|\| \{(.*?)\}/g, "message: typeof unwrapped.message === 'string' ? unwrapped.message : ''");

  // Fix meta: unwrapped.meta to pagination: unwrapped.pagination
  content = content.replace(/meta:\s*unwrapped\.meta/g, 'pagination: unwrapped.pagination');
  
  // Fix { success: ... } inside service methods.
  content = content.replace(/success:\s*unwrapped\.status === 'success',/g, "status: unwrapped.status,");
  content = content.replace(/success:\s*false,/g, "status: 'error',");
  content = content.replace(/success:\s*true,/g, "status: 'success',");
  
  content = content.replace(/error:\s*unwrapped\.message/g, 'message: typeof unwrapped.message === "string" ? unwrapped.message : ""');
  
  // Remove duplicate message: '...'.message
  content = content.replace(/'(.+?)'\?\.message/g, "'$1'");
  
  // Replace error: { message: ... } with message: ...
  content = content.replace(/error:\s*\{\s*message:\s*([^}]+)\s*\}/g, 'message: $1');
  
  // Sometimes error: unwrapped.error is still there
  content = content.replace(/error:\s*unwrapped\.error/g, 'message: unwrapped.message');

  fs.writeFileSync(p, content);
}
console.log('Fixed services');
