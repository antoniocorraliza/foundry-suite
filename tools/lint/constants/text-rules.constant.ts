import type { TextRule } from '../interfaces/text-rule.interface.ts';
import { LIBRARY_STYLE_FILE, LIBRARY_TEMPLATE_FILE, MARKDOWN_FILE, TYPESCRIPT_FILE } from './file-patterns.constant.ts';

export const TEXT_RULES: ReadonlyArray<TextRule> = [
  {
    name: 'typographic character',
    // Arrows, ellipsis, middle dot, multiplication sign, check marks, long dashes, curly quotes and box drawing.
    pattern: /[←-⇿…·×✓-✘–—‘’“”─-╿]/u,
  },
  // The copyright and registered signs are pictographic too, but they are allowed.
  { name: 'emoji', pattern: /(?![\u00a9\u00ae])\p{Extended_Pictographic}/u },
  {
    name: 'process reference',
    pattern: /\bdecisions? \d+\b/i,
  },
  { name: 'section marker as JSDoc', pattern: /\/\*\*\s*[A-Z][A-Z &]+\s*\*\// },
  { name: 'list item that starts in bold', pattern: /^\s*(?:[-*+]|\d+\.)\s+\*\*/, onlyIn: MARKDOWN_FILE },
  {
    name: 'sales word',
    pattern: /\b(?:seamless(?:ly)?|robust|comprehensive|powerful|enterprise|leverag(?:e|es|ed|ing))\b/i,
    onlyIn: MARKDOWN_FILE,
  },
  // A line of a JSDoc block: it starts with /** or with the * of the block.
  {
    name: 'sales word in JSDoc',
    pattern:
      /^\s*(?:\/\*\*|\*(?!\/))[^\n]*?\b(?:seamless(?:ly)?|robust|comprehensive|powerful|enterprise|leverag(?:e|es|ed|ing)|simple|simply|easy|easily|efficient(?:ly)?|for convenience|as expected)\b/i,
    onlyIn: TYPESCRIPT_FILE,
  },
  {
    name: 'filler in JSDoc',
    pattern:
      /^\s*(?:\/\*\*|\*(?!\/))\s*(?:This (?:function|method|class|service|component|directive|pipe|type|interface|constant)|An? (?:helper|utility|wrapper)|(?:Helper|Utility) (?:to|for|that))\b|^\s*(?:\/\*\*|\*(?!\/))[^\n]*?\b(?:note that|under the hood|out of the box|it is worth noting)\b/i,
    onlyIn: TYPESCRIPT_FILE,
  },
  { name: 'comment in a library', pattern: /<!--/, onlyIn: LIBRARY_TEMPLATE_FILE },
  { name: 'comment in a library', pattern: /\/\*|^\s*\/\//, onlyIn: LIBRARY_STYLE_FILE },
];
