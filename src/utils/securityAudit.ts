import DOMPurify from 'isomorphic-dompurify';

// Exact sanitization logic used inside our RichTextRenderer
function sanitizeContent(content: string): string {
  if (!content) return '';
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'span', 'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'sub', 'sup', 'mark'
    ],
    ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'target', 'class', 'style', 'align', 'width', 'height'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

interface TestCase {
  id: number;
  name: string;
  payload: string;
  validate: (sanitized: string) => boolean;
}

const testCases: TestCase[] = [
  {
    id: 1,
    name: "Script tag execution",
    payload: "<script>alert(1)</script>",
    validate: (sanitized) => !sanitized.includes("<script>") && !sanitized.includes("alert(1)")
  },
  {
    id: 2,
    name: "Image with onerror handler",
    payload: "<img src=x onerror=alert(1)>",
    validate: (sanitized) => !sanitized.includes("onerror") && !sanitized.includes("alert(1)")
  },
  {
    id: 3,
    name: "Javascript: URI scheme link",
    payload: "<a href=\"javascript:alert(1)\">Click</a>",
    validate: (sanitized) => !sanitized.includes("javascript:") && !sanitized.includes("alert(1)")
  },
  {
    id: 4,
    name: "Iframe element injection",
    payload: "<iframe src=\"https://evil.com\"></iframe>",
    validate: (sanitized) => !sanitized.includes("<iframe")
  },
  {
    id: 5,
    name: "Object element injection",
    payload: "<object data=\"evil.swf\"></object>",
    validate: (sanitized) => !sanitized.includes("<object")
  },
  {
    id: 6,
    name: "Embed element injection",
    payload: "<embed src=\"evil.swf\"></embed>",
    validate: (sanitized) => !sanitized.includes("<embed")
  },
  {
    id: 7,
    name: "Inline event handlers (onclick)",
    payload: "<p onclick=\"doSomething()\">Text</p>",
    validate: (sanitized) => !sanitized.includes("onclick") && !sanitized.includes("doSomething")
  },
  {
    id: 8,
    name: "Dangerous protocols (data: or vbscript:)",
    payload: "<a href=\"data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==\">Click</a>",
    validate: (sanitized) => !sanitized.includes("data:")
  },
  {
    id: 9,
    name: "Malformed HTML recovery",
    payload: "<section><p>Malformed text <strong>bold text",
    validate: (sanitized) => sanitized.includes("bold text</strong>") || (sanitized.includes("bold text") && !sanitized.includes("<section>"))
  },
  {
    id: 10,
    name: "Normal Cloudinary HTTPS image",
    payload: "<img src=\"https://res.cloudinary.com/demo/image/upload/sample.jpg\" alt=\"Cloudinary demo\" />",
    validate: (sanitized) => sanitized.includes("cloudinary.com") && sanitized.includes("sample.jpg") && sanitized.includes("alt=\"Cloudinary demo\"")
  },
  {
    id: 11,
    name: "Normal HTTPS external link",
    payload: "<a href=\"https://google.com\">Google</a>",
    validate: (sanitized) => sanitized.includes("https://google.com") && sanitized.includes("Google")
  },
  {
    id: 12,
    name: "Normal formatting HTML (headings, bold, lists)",
    payload: "<h1>Title</h1><p>Hello <strong>world</strong></p><ul><li>List Item</li></ul>",
    validate: (sanitized) => sanitized.includes("<h1>Title</h1>") && sanitized.includes("<strong>world</strong>") && sanitized.includes("<li>List Item</li>")
  }
];

function runSecurityAudit() {
  console.log("=================================================");
  console.log("     STOREFRONT RICH TEXT SECURITY AUDIT         ");
  console.log("=================================================");
  let overallPass = true;

  testCases.forEach((tc) => {
    const sanitized = sanitizeContent(tc.payload);
    const passed = tc.validate(sanitized);
    if (!passed) {
      overallPass = false;
    }
    console.log(`[${passed ? 'PASS' : 'FAIL'}] Test #${tc.id}: ${tc.name}`);
    console.log(`  - Input:  ${tc.payload}`);
    console.log(`  - Output: ${sanitized}\n`);
  });

  console.log("=================================================");
  console.log(`OVERALL STATUS: ${overallPass ? 'PASSED' : 'FAILED'}`);
  console.log("=================================================");
  
  if (!overallPass) {
    process.exit(1);
  }
}

runSecurityAudit();
