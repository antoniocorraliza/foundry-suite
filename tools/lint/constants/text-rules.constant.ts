import type { TextRule } from '../interfaces/text-rule.interface.ts';
import { LIBRARY_CODE_FILE, LIBRARY_STYLE_FILE, LIBRARY_TEMPLATE_FILE, MARKDOWN_FILE, TYPESCRIPT_FILE } from './file-patterns.constant.ts';

const SALES_WORDS: string = 'seamless(?:ly)?|robust|comprehensive|powerful|enterprise|leverag(?:e|es|ed|ing)';
const JSDOC_LINE_START: string = String.raw`^\s*(?:\/\*\*|\*(?!\/))`;
const FILLER_OPENINGS: string = [
  'This (?:function|method|class|service|component|directive|pipe|type|interface|constant)',
  'An? (?:helper|utility|wrapper)',
  '(?:Helper|Utility) (?:to|for|that)',
].join('|');
const FILLER_PHRASES: string = 'note that|under the hood|out of the box|it is worth noting|for convenience|as expected';

export const TEXT_RULES: ReadonlyArray<TextRule> = [
  {
    name: 'typographic character',
    // Arrows, ellipsis, middle dot, multiplication sign, check marks, dashes, curly quotes, box drawing; the private prefix inside a name.
    pattern:
      /[\u2190-\u21ff\u2026\u00b7\u00d7\u2713-\u2718\u2013\u2014\u2018\u2019\u201c\u201d\u2500-\u257f]|(?<=[\p{L}\p{N}_$])\u0275|\u0275(?![\p{L}\p{N}_$])/u,
    isAllowedInTestData: true,
  },
  {
    name: 'character that is not plain ASCII in a library (write it as an escape)',
    pattern: /[^\t\r\u0020-\u007e\u0275]|(?<=[\p{L}\p{N}_$])\u0275|\u0275(?![\p{L}\p{N}_$])/u,
    onlyIn: LIBRARY_CODE_FILE,
  },
  // The copyright and registered signs are pictographic too, but they are allowed.
  { name: 'emoji', pattern: /(?![\u00a9\u00ae])\p{Extended_Pictographic}/u, isAllowedInTestData: true },
  {
    name: 'process reference',
    pattern: /\bdecisions? \d+\b/i,
  },
  { name: 'section marker as JSDoc', pattern: /\/\*\*\s*[A-Z][A-Z &]+\s*\*\// },
  { name: 'list item that starts in bold', pattern: /^\s*(?:[-*+]|\d+\.)\s+\*\*/, onlyIn: MARKDOWN_FILE },
  { name: 'sales word', pattern: new RegExp(String.raw`\b(?:${SALES_WORDS})\b`, 'i'), onlyIn: MARKDOWN_FILE },
  {
    name: 'sales word in JSDoc',
    pattern: new RegExp(String.raw`${JSDOC_LINE_START}[^\n]*?\b(?:${SALES_WORDS}|simple|simply|easy|easily|efficient(?:ly)?)\b`, 'i'),
    onlyIn: TYPESCRIPT_FILE,
  },
  {
    name: 'filler in JSDoc',
    pattern: new RegExp(
      String.raw`${JSDOC_LINE_START}\s*(?:${FILLER_OPENINGS})\b|${JSDOC_LINE_START}[^\n]*?\b(?:${FILLER_PHRASES})\b`,
      'i',
    ),
    onlyIn: TYPESCRIPT_FILE,
  },
  { name: 'comment in a library', pattern: /<!--/, onlyIn: LIBRARY_TEMPLATE_FILE },
  { name: 'ngClass or ngStyle (bind [class.name] and [style.property])', pattern: /\bng(?:Class|Style)\b/, onlyIn: LIBRARY_TEMPLATE_FILE },
  { name: 'async pipe (subscribe in a method and keep the value in a signal)', pattern: /\|\s*async\b/, onlyIn: LIBRARY_TEMPLATE_FILE },
  { name: 'comment in a library', pattern: /\/\*|^\s*\/\//, onlyIn: LIBRARY_STYLE_FILE },
];
