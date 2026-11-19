import { describe, expect, it } from 'vitest';
import { maskTestData } from './mask-test-data.function.ts';

describe('maskTestData', () => {
  it('blanks the text of string and template literals and keeps the code, the lines and the columns', () => {
    const text: string = ["expect(read('a b')).toBe(`c ${value} d`);", "const rows: Array<string> = ['e',", "  'f'];"].join('\n');
    expect(maskTestData('a.spec.ts', text)).toBe(
      ["expect(read('   ')).toBe(`  ${value}  `);", "const rows: Array<string> = [' ',", "  ' '];"].join('\n'),
    );
  });

  it('keeps the titles of describe, it and test', () => {
    const text: string = [
      "describe('reader', () => {",
      "  it.each([['x']])('reads %s', (value) => {",
      "    test(`returns ${value}`, () => expect(value).toBe('y'));",
      '  });',
      '});',
    ].join('\n');
    expect(maskTestData('a.spec.ts', text)).toBe(
      [
        "describe('reader', () => {",
        "  it.each([[' ']])('reads %s', (value) => {",
        "    test(`returns ${value}`, () => expect(value).toBe(' '));",
        '  });',
        '});',
      ].join('\n'),
    );
  });

  it('keeps the line breaks of a template literal', () => {
    expect(maskTestData('a.spec.ts', 'const csv: string = `a;b\nc;d`;')).toBe('const csv: string = `   \n   `;');
  });
});
