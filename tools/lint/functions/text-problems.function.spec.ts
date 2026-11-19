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

  it.each([
    ['a sales word', ' * Parses a day in a simple way.', 'sales word in JSDoc'],
    ['a phrase that says nothing', ' * Returns the day, as expected.', 'sales word in JSDoc'],
    ['a "This function" opening', '/** This function parses a day. */', 'filler in JSDoc'],
    ['a "Helper to" opening', ' * Helper to parse a day.', 'filler in JSDoc'],
    ['a "note that"', ' * Returns null. Note that the day is local.', 'filler in JSDoc'],
  ])('reports %s in a JSDoc line', (_description, line, rule) => {
    expect(textProblems('a.ts', line)).toEqual([`a.ts:1: ${rule}: ${line.trim()}`]);
  });

  it('leaves the same words alone outside JSDoc', () => {
    expect(textProblems('a.ts', "const simple: string = 'easy';\n// Helper to read a file.")).toEqual([]);
  });

  it('reports comments in the templates and styles of the libraries', () => {
    expect(textProblems('projects/a/b.component.html', '<!-- a note -->\n<p></p>')).toEqual([
      'projects/a/b.component.html:1: comment in a library: <!-- a note -->',
    ]);
    expect(textProblems('projects/a/b.component.scss', '/* a note */\n// another\n.a { color: red; }')).toEqual([
      'projects/a/b.component.scss:1: comment in a library: /* a note */',
      'projects/a/b.component.scss:2: comment in a library: // another',
    ]);
    expect(textProblems('tools/a.scss', '/* a note */')).toEqual([]);
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
