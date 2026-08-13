const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  // Fix { message: '...'?.message || 'Error', data: null } -> '...'
  content = content.replace(/\{ message: '(.+?)'\?\.message \|\| 'Error', data: null \}/g, "'$1'");
  
  // Fix `Failed to fetch X '${slug, data: null'` } -> `Failed to fetch X '${slug}'`, data: null as any
  content = content.replace(/`Failed to fetch (.+?) '\$\{([^}]+)\}, data: null'` \}/g, "`Failed to fetch $1 '${$2}'`, data: null as any");
  
  fs.writeFileSync(path, content);
};

fixFile('src/services/contentService.ts');
fixFile('src/services/orderService.ts');
fixFile('src/services/productService.ts');

