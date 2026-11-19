import { describe, expect, it } from 'vitest';
import { textProblems } from './text-problems.function.ts';

describe('textProblems', () => {
  it('accepts plain text', () => {
    expect(textProblems('a.ts', '// ng-packagr 21 adds tslib to dependencies.\nconst copyright: string = "© 2026";')).toEqual([]);
  });

  it.each([
    ['an arrow', 'a → b', 'typographic character'],
    ['an ellipsis', 'wait…', 'typographic character'],
    ['a middle dot', 'Unit · Angular 21', 'typographic character'],
    ['a long dash', 'one — two', 'typographic character'],
    ['curly quotes', '“quoted”', 'typographic character'],
    ['an emoji', 'done ✅', 'emoji'],
    ['a decision number', 'see decision 26', 'process reference'],
    ['a review code', 'see CORE2-R1', 'review code'],
    ['a section marker as JSDoc', '/** ACTIONS */', 'section marker as JSDoc'],
  ])('reports %s', (_description, line, rule) => {
    expect(textProblems('a.ts', `first line\n${line}`)).toEqual([`a.ts:2: ${rule}: ${line}`]);
  });

  it('checks bold list items and sales words only in Markdown', () => {
    const text: string = '- **Robust** parsing\n- a seamless API';
    expect(textProblems('a.ts', text)).toEqual([]);
    expect(textProblems('README.md', text)).toEqual([
      'README.md:1: list item that starts in bold: - **Robust** parsing',
      'README.md:1: sales word: - **Robust** parsing',
      'README.md:2: sales word: - a seamless API',
    ]);
  });
});
