import { describe, expect, it } from 'vitest';
import { textProblems } from './text-problems.function.ts';

const NOT_ASCII: string = 'character that is not plain ASCII in a library (write it as an escape)';

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
    ['the Angular private prefix inside a name', 'const formatɵDate: string = name;', 'typographic character'],
    ['the Angular private prefix alone', "const prefix: string = 'ɵ';", 'typographic character'],
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

  it('accepts the Angular private prefix at the start of a name', () => {
    const text: string = "export function ɵforEachOwnKey(): void {}\nimport { ɵforEachOwnKey } from '@antoniocorraliza/foundry-utils';";
    expect(textProblems('projects/a/src/functions/for-each-own-key.function.ts', text)).toEqual([]);
  });

  it('accepts any character in the text literals of a spec', () => {
    const text: string = [
      "it('truncates a long name', () => {",
      "  expect(truncateText('Nuñez Ibáñez', 8)).toBe('Nuñez I…');",
      "  expect(splitGraphemes(`🍎🍌🍒`)).toEqual(['🍎', '🍌', '🍒']);",
      "  expect(toTitleCase('o’neill')).toBe('O’Neill');",
      "  expect(parseDecimal('١٢٣', 'ar-EG')).toBe(123);",
      "  expect(toSlug('日本語 — ×')).toBe('');",
      '});',
    ].join('\n');
    expect(textProblems('projects/a/src/functions/truncate-text.function.spec.ts', text)).toEqual([]);
  });

  it('still checks the titles and the code of a spec', () => {
    const text: string = ["it('truncates with …', () => {", '  expect(/…/.test(value)).toBe(true);', '});'].join('\n');
    expect(textProblems('projects/a/src/functions/truncate-text.function.spec.ts', text)).toEqual([
      "projects/a/src/functions/truncate-text.function.spec.ts:1: typographic character: it('truncates with …', () => {",
      'projects/a/src/functions/truncate-text.function.spec.ts:2: typographic character: expect(/…/.test(value)).toBe(true);',
    ]);
  });

  it('checks the text literals of the library code', () => {
    const text: string = "const suffix: string = '…';\nconst fruit: string = '🍎';";
    expect(textProblems('projects/a/src/functions/truncate-text.function.ts', text)).toEqual([
      "projects/a/src/functions/truncate-text.function.ts:1: typographic character: const suffix: string = '…';",
      `projects/a/src/functions/truncate-text.function.ts:1: ${NOT_ASCII}: const suffix: string = '…';`,
      `projects/a/src/functions/truncate-text.function.ts:2: ${NOT_ASCII}: const fruit: string = '🍎';`,
      "projects/a/src/functions/truncate-text.function.ts:2: emoji: const fruit: string = '🍎';",
    ]);
  });

  it('accepts escapes and the Angular private prefix in the library code', () => {
    const text: string = [
      "export const SUFFIX: string = '\\u2026';",
      "const separators: string = '\\u00a0\\u202f\\u2212';",
      'export function ɵforEachOwnKey(): void {}',
    ].join('\n');
    expect(textProblems('projects/a/src/functions/to-slug.function.ts', text)).toEqual([]);
  });

  it.each([
    ['a letter of another alphabet', "const sharpS: string = 'ß';"],
    ['an accented letter', "const name: string = 'Nuñez';"],
    ['a no-break space', "const space: string = '\u00a0';"],
    ['a narrow no-break space', "const space: string = '\u202f';"],
    ['the minus sign', "const minus: string = '\u2212';"],
    ['a digit that is not Latin', "const one: string = '\u0661';"],
  ])('reports %s pasted in the library code', (_description, line) => {
    expect(textProblems('projects/a/src/functions/to-slug.function.ts', line)).toEqual([
      `projects/a/src/functions/to-slug.function.ts:1: ${NOT_ASCII}: ${line}`,
    ]);
  });

  it('leaves characters that are not ASCII alone in the specs and in tools', () => {
    const line: string = "const name: string = 'Nuñez\u00a0\u202f\u2212';";
    expect(textProblems('projects/a/src/functions/to-slug.function.spec.ts', line)).toEqual([]);
    expect(textProblems('tools/a.ts', line)).toEqual([]);
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

  it('reports ngClass, ngStyle and the async pipe in the templates of the libraries', () => {
    const path: string = 'projects/a/src/components/panel/panel.component.html';
    const text: string = ['<p [ngClass]="classes()">', '<p [ngStyle]="styles()">', '<p>{{ itemsObservable | async }}</p>'].join('\n');
    expect(textProblems(path, text)).toEqual([
      `${path}:1: ngClass or ngStyle (bind [class.name] and [style.property]): <p [ngClass]="classes()">`,
      `${path}:2: ngClass or ngStyle (bind [class.name] and [style.property]): <p [ngStyle]="styles()">`,
      `${path}:3: async pipe (subscribe in a method and keep the value in a signal): <p>{{ itemsObservable | async }}</p>`,
    ]);
  });

  it('accepts class and style bindings in the templates of the libraries', () => {
    const text: string = '<p [class.isOpen]="isOpen()" [style.width.px]="width()">{{ total() }}</p>';
    expect(textProblems('projects/a/src/components/panel/panel.component.html', text)).toEqual([]);
  });
});
