import React from 'react';
import parse, { HTMLReactParserOptions, domToReact } from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // 1. Sanitize the HTML content on both client & server using DOMPurify
  const sanitizedHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'span', 'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'target', 'class', 'style'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });

  // 2. Map HTML elements recursively into high-quality styled React elements using Tailwind
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if ('name' in domNode && domNode.type === 'tag') {
        const { name, attribs = {}, children = [] } = domNode;
        const reactChildren = domToReact(children as any, parserOptions);

        switch (name) {
          case 'h1':
            return (
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 leading-tight">
                {reactChildren}
              </h1>
            );
          case 'h2':
            return (
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-7 mb-3 leading-snug">
                {reactChildren}
              </h2>
            );
          case 'h3':
            return (
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2">
                {reactChildren}
              </h3>
            );
          case 'h4':
          case 'h5':
          case 'h6':
            return (
              <h4 className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white mt-5 mb-2">
                {reactChildren}
              </h4>
            );
          case 'p':
            return (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {reactChildren}
              </p>
            );
          case 'ul':
            return (
              <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {reactChildren}
              </ul>
            );
          case 'ol':
            return (
              <ol className="list-decimal pl-6 mb-4 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {reactChildren}
              </ol>
            );
          case 'li':
            return <li className="leading-relaxed marker:text-gray-400">{reactChildren}</li>;
          case 'strong':
            return <strong className="font-bold text-gray-950 dark:text-white">{reactChildren}</strong>;
          case 'em':
            return <em className="italic">{reactChildren}</em>;
          case 'u':
            return <u className="underline text-inherit">{reactChildren}</u>;
          case 'blockquote':
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-600 dark:text-gray-400 my-6 bg-gray-50 dark:bg-gray-800/50 py-3 pr-2 rounded-r">
                {reactChildren}
              </blockquote>
            );
          case 'pre':
            return (
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono my-6 leading-relaxed">
                {reactChildren}
              </pre>
            );
          case 'code':
            return (
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-[#E01E5A] dark:text-[#F35E8E] rounded text-xs sm:text-sm font-mono break-all">
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
                className="text-[#3B82F6] hover:text-[#2563EB] dark:text-blue-400 dark:hover:text-blue-300 font-medium underline transition-colors duration-200 break-all"
                {...extraProps}
              >
                {reactChildren}
              </a>
            );
          }
          case 'img':
            return (
              <span className="block my-8 max-w-full overflow-hidden rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
                <img
                  src={attribs.src || ''}
                  alt={attribs.alt || 'Content visual'}
                  referrerPolicy="no-referrer"
                  className="max-w-full h-auto mx-auto block object-cover rounded-xl"
                />
              </span>
            );
          case 'table':
            return (
              <div className="overflow-x-auto my-8 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm text-gray-700 dark:text-gray-300">
                  {reactChildren}
                </table>
              </div>
            );
          case 'thead':
            return <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white uppercase font-semibold text-xs tracking-wider">{reactChildren}</thead>;
          case 'tbody':
            return <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">{reactChildren}</tbody>;
          case 'tr':
            return <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">{reactChildren}</tr>;
          case 'th':
            return <th className="px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700">{reactChildren}</th>;
          case 'td':
            return <td className="px-4 py-3.5 align-middle">{reactChildren}</td>;
          default:
            return undefined;
        }
      }
      return undefined;
    },
  };

  return (
    <div className={`rich-text-content break-words overflow-wrap-anywhere ${className}`}>
      {parse(sanitizedHtml, parserOptions)}
    </div>
  );
};
