const fs = require('fs');
const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/return \{\s*status:\s*'error',\s*message:\s*([^,]+?)\s*\};/g, "return { status: 'error', message: $1, data: null as any };");
  fs.writeFileSync(file, content);
};
fixFile('src/services/checkoutService.ts');
fixFile('src/services/paymentService.ts');
fixFile('src/services/returnService.ts');
