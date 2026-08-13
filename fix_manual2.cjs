const fs = require('fs');

let content = fs.readFileSync('src/services/orderService.ts', 'utf8');
content = content.replace(/`Failed to fetch order \$\{id, data: null` \}/g, "`Failed to fetch order ${id}`, data: null as any }");
content = content.replace(/success: unwrapped\.status === 'success', data: unwrapped\.data, error: unwrapped\.message/g, "status: unwrapped.status, data: unwrapped.data, message: typeof unwrapped.message === 'string' ? unwrapped.message : ''");
content = content.replace(/message: unwrapped\.message \|\| 'Order not found' \}/g, "message: unwrapped.message || 'Order not found', data: null as any }");
fs.writeFileSync('src/services/orderService.ts', content);

