import React from 'react';
import parse, { HTMLReactParserOptions, domToReact } from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

// Safely convert inline style strings and align attributes to React CSSProperties
function parseInlineStyle(styleString?: string, alignAttr?: string): React.CSSProperties | undefined {
  const styleObj: Record<string, string> = {};
  
  if (styleString && typeof styleString === 'string') {
    const declarations = styleString.split(';');
    for (const declaration of declarations) {
      const colonIdx = declaration.indexOf(':');
      if (colonIdx === -1) continue;
      
      const prop = declaration.slice(0, colonIdx).trim();
      const val = declaration.slice(colonIdx + 1).trim();
      if (!prop || !val) continue;
      
      // Convert CSS kebab-case (e.g. text-align, background-color) to camelCase (textAlign, backgroundColor)
      const camelProp = prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      styleObj[camelProp] = val;
    }
  }

  if (alignAttr && !styleObj.textAlign) {
    if (['left', 'center', 'right', 'justify'].includes(alignAttr.toLowerCase())) {
      styleObj.textAlign = alignAttr.toLowerCase();
    }
  }
  
  return Object.keys(styleObj).length > 0 ? (styleObj as React.CSSProperties) : undefined;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // 1. Sanitize the HTML content on both client & server using DOMPurify
  const sanitizedHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'span', 'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'sub', 'sup', 'mark'
    ],
    ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'target', 'class', 'style', 'align', 'width', 'height'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });

  // 2. Map HTML elements recursively into high-quality styled React elements using Tailwind
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if ('name' in domNode && domNode.type === 'tag') {
        const { name, attribs = {}, children = [] } = domNode;
        const reactChildren = domToReact(children as any, parserOptions);
        const style = parseInlineStyle(attribs.style, attribs.align);

        switch (name) {
          case 'h1':
            return (
              <h1
                style={style}
                className={`text-xl sm:text-2xl font-black text-[#111827] mt-8 mb-4 leading-tight ${attribs.class || ''}`}
              >
                {reactChildren}
              </h1>
            );
          case 'h2':
            return (
              <h2
                style={style}
                className={`text-lg sm:text-xl font-bold text-[#111827] mt-7 mb-3 leading-snug ${attribs.class || ''}`}
              >
                {reactChildren}
              </h2>
            );
          case 'h3':
            return (
              <h3
                style={style}
                className={`text-base sm:text-lg font-bold text-[#111827] mt-6 mb-2 ${attribs.class || ''}`}
              >
                {reactChildren}
              </h3>
            );
          case 'h4':
          case 'h5':
          case 'h6':
            return (
              <h4
                style={style}
                className={`text-sm sm:text-base font-semibold text-[#111827] mt-5 mb-2 ${attribs.class || ''}`}
              >
                {reactChildren}
              </h4>
            );
          case 'p':
            return (
              <p
                style={style}
                className={`text-sm sm:text-base text-[#111827] leading-relaxed mb-4 ${attribs.class || ''}`}
              >
                {reactChildren}
              </p>
            );
          case 'div':
            return (
              <div
                style={style}
                className={`mb-4 ${attribs.class || ''}`}
              >
                {reactChildren}
              </div>
            );
          case 'span':
            return (
              <span
                style={style}
                className={attribs.class}
              >
                {reactChildren}
              </span>
            );
          case 'ul':
            return (
              <ul
                style={style}
                className={`list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-[#111827] ${attribs.class || ''}`}
              >
                {reactChildren}
              </ul>
            );
          case 'ol':
            return (
              <ol
                style={style}
                className={`list-decimal pl-6 mb-4 space-y-1 text-sm sm:text-base text-[#111827] ${attribs.class || ''}`}
              >
                {reactChildren}
              </ol>
            );
          case 'li':
            return (
              <li
                style={style}
                className={`leading-relaxed marker:text-gray-400 ${attribs.class || ''}`}
              >
                {reactChildren}
              </li>
            );
          case 'strong':
          case 'b':
            return (
              <strong
                style={style}
                className={`font-bold text-[#111827] ${attribs.class || ''}`}
              >
                {reactChildren}
              </strong>
            );
          case 'em':
          case 'i':
            return (
              <em
                style={style}
                className={`italic ${attribs.class || ''}`}
              >
                {reactChildren}
              </em>
            );
          case 'u':
            return (
              <u
                style={style}
                className={`underline text-inherit ${attribs.class || ''}`}
              >
                {reactChildren}
              </u>
            );
          case 's':
          case 'del':
            return (
              <del
                style={style}
                className={`line-through text-inherit ${attribs.class || ''}`}
              >
                {reactChildren}
              </del>
            );
          case 'mark':
            return (
              <mark
                style={style}
                className={`bg-yellow-100 text-yellow-950 px-1 py-0.5 rounded ${attribs.class || ''}`}
              >
                {reactChildren}
              </mark>
            );
          case 'hr':
            return (
              <hr
                style={style}
                className={`my-8 border-t border-gray-200 ${attribs.class || ''}`}
              />
            );
          case 'blockquote':
            return (
              <blockquote
                style={style}
                className={`border-l-4 border-gray-300 pl-4 italic text-[#374151] my-6 bg-gray-50 py-3 pr-2 rounded-r ${attribs.class || ''}`}
              >
                {reactChildren}
              </blockquote>
            );
          case 'pre':
            return (
              <pre
                style={style}
                className={`p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono my-6 leading-relaxed ${attribs.class || ''}`}
              >
                {reactChildren}
              </pre>
            );
          case 'code':
            return (
              <code
                style={style}
                className={`px-1.5 py-0.5 bg-gray-100 text-[#E01E5A] rounded text-xs sm:text-sm font-mono break-all ${attribs.class || ''}`}
              >
                {reactChildren}
              </code>
            );
          case 'a': {
            const href = attribs.href || '#';
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            const extraProps = isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {};
            return (
              <a
                href={href}
                style={style}
                className={`text-[#3B82F6] hover:text-[#2563EB] font-medium underline transition-colors duration-200 break-all ${attribs.class || ''}`}
                {...extraProps}
              >
                {reactChildren}
              </a>
            );
          }
          case 'img':
            return (
              <span className="block my-8 max-w-full overflow-hidden rounded-xl shadow-md border border-gray-100">
                <img
                  src={attribs.src || ''}
                  alt={attribs.alt || 'Content visual'}
                  style={style}
                  referrerPolicy="no-referrer"
                  className={`max-w-full h-auto mx-auto block object-cover rounded-xl ${attribs.class || ''}`}
                />
              </span>
            );
          case 'table':
            return (
              <div className="overflow-x-auto my-8 border border-gray-200 rounded-xl shadow-xs">
                <table
                  style={style}
                  className={`min-w-full divide-y divide-gray-200 text-left text-sm text-[#111827] ${attribs.class || ''}`}
                >
                  {reactChildren}
                </table>
              </div>
            );
          case 'thead':
            return (
              <thead
                style={style}
                className={`bg-gray-50 text-[#111827] uppercase font-semibold text-xs tracking-wider ${attribs.class || ''}`}
              >
                {reactChildren}
              </thead>
            );
          case 'tbody':
            return (
              <tbody
                style={style}
                className={`divide-y divide-gray-200 bg-white ${attribs.class || ''}`}
              >
                {reactChildren}
              </tbody>
            );
          case 'tr':
            return (
              <tr
                style={style}
                className={`hover:bg-gray-50/50 transition-colors ${attribs.class || ''}`}
              >
                {reactChildren}
              </tr>
            );
          case 'th':
            return (
              <th
                style={style}
                className={`px-4 py-3 font-semibold border-b border-gray-200 ${attribs.class || ''}`}
              >
                {reactChildren}
              </th>
            );
          case 'td':
            return (
              <td
                style={style}
                className={`px-4 py-3.5 align-middle ${attribs.class || ''}`}
              >
                {reactChildren}
              </td>
            );
          default:
            return undefined;
        }
      }
      return undefined;
    },
  };

  return (
    <div 
      className={`rich-text-content text-[#111827] break-words overflow-wrap-anywhere ${className}`}
      style={{ colorScheme: 'light' }}
    >
      {parse(sanitizedHtml, parserOptions)}
    </div>
  );
};

