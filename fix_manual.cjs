const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/`Failed to fetch ([^']+) '\$\{slug, data: null'` \}/g, "`Failed to fetch $1 '${slug}'`, data: null as any");
  content = content.replace(/`Failed to fetch page '\$\{slug, data: null'` \}/g, "`Failed to fetch page '${slug}'`, data: null as any");
  content = content.replace(/`Failed to fetch product '\$\{slug, data: null'` \}/g, "`Failed to fetch product '${slug}'`, data: null as any");
  content = content.replace(/message: unwrapped\.message \|\| 'Blog article not found' \}/g, "message: unwrapped.message || 'Blog article not found', data: null as any }");
  content = content.replace(/message: unwrapped\.message \|\| 'Page not found' \}/g, "message: unwrapped.message || 'Page not found', data: null as any }");
  content = content.replace(/message: unwrapped\.message \|\| 'Order not found' \}/g, "message: unwrapped.message || 'Order not found', data: null as any }");
  content = content.replace(/message: unwrapped\.message \|\| 'Product not found' \}/g, "message: unwrapped.message || 'Product not found', data: null as any }");
  
  // order service has some extra errors
  fs.writeFileSync(path, content);
};

fixFile('src/services/contentService.ts');
fixFile('src/services/productService.ts');

