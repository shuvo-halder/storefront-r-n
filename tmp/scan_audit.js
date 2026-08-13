const fs = require('fs');
const path = require('path');

function scanDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, results);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/href=["']#["']/i.test(line)) {
          results.push({ file: fullPath, line: idx + 1, type: 'href="#"', code: line.trim() });
        }
        if (/javascript:void/i.test(line)) {
          results.push({ file: fullPath, line: idx + 1, type: 'javascript:void', code: line.trim() });
        }
        if (/\bTODO\b|\bFIXME\b/i.test(line)) {
          results.push({ file: fullPath, line: idx + 1, type: 'TODO/FIXME', code: line.trim() });
        }
        if (/\.map\s*\(\s*\(?[a-zA-Z0-9_$]+\)?\s*=>/i.test(line) && !line.includes('Array.isArray') && !line.includes('?.map') && !line.includes('|| []')) {
          // potential unsafe map check
        }
      });
    }
  }
  return results;
}

const audit = scanDir('./src').concat(scanDir('./app'));
console.log('Anti-pattern scan total issues count:', audit.length);
if (audit.length > 0) {
  console.log(JSON.stringify(audit, null, 2));
} else {
  console.log('No anti-patterns found (0 href="#", 0 javascript:void, 0 TODO/FIXME)!');
}
