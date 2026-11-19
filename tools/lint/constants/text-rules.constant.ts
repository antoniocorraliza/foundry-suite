import type { TextRule } from '../interfaces/text-rule.interface.ts';
import { MARKDOWN_FILE } from './file-patterns.constant.ts';

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
];
