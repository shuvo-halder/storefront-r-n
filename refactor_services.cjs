const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.ts'));

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace ApiResult<X> with ApiResponse<X>
  content = content.replace(/ApiResult</g, 'ApiResponse<');
  content = content.replace(/ApiResult\b/g, 'ApiResponse');

  // Replace { success: true, data: X, error: null } with { status: 'success', message: '', data: X }
  content = content.replace(/success:\s*true\s*,\s*data:\s*(.+?)\s*,\s*error:\s*null/g, "status: 'success', message: '', data: $1");

  // Replace { success: false, data: X, error: { message: Y } } with { status: 'error', message: Y, data: X }
  content = content.replace(/success:\s*false\s*,\s*data:\s*(.+?)\s*,\s*error:\s*{\s*message:\s*(.+?)\s*}/g, "status: 'error', message: $2, data: $1");
  content = content.replace(/success:\s*false\s*,\s*data:\s*(.+?)\s*,\s*error:\s*(.+?)\s*(,\s*meta:\s*unwrapped\.meta)?\s*}/g, (match, data, error) => {
    // If it's the complex catch block
    return `status: 'error', message: ${error}?.message || 'Error', data: ${data} }`;
  });

  // Replace unwrapped.success with unwrapped.status === 'success'
  content = content.replace(/!unwrapped\.success/g, "unwrapped.status === 'error'");
  content = content.replace(/unwrapped\.success/g, "unwrapped.status === 'success'");

  // Replace unwrapped.error with unwrapped.message
  content = content.replace(/unwrapped\.error/g, "unwrapped.message");

  // Replace error.message with err.message or similar
  content = content.replace(/error:\s*\{\s*message:\s*err\.response\?\.data\?\.message \|\| err\.message \|\| (.+?)\s*\}/g, "status: 'error', message: err.response?.data?.message || err.message || $1");

  fs.writeFileSync(filePath, content);
}
console.log('Done refactoring service files');
