import { describe, expect, it } from 'vitest';
import { findNameOnlyJsdocProblems } from './find-name-only-jsdoc-problems.function.ts';

describe('findNameOnlyJsdocProblems', () => {
  it('reports a JSDoc whose first sentence only repeats the name, after the verb of a function', () => {
    const source: string = [
      '/** Checks the cell count. */',
      'export function checkCellCount(): void {}',
      '',
      '/**',
      ' * Milliseconds of a second.',
      ' * @see nothing',
      ' */',
      'export const MILLISECONDS_PER_SECOND: number = 1000;',
      '/** Kind of a value. */',
      'export type ValueKind = string;',
    ].join('\n');
    expect(findNameOnlyJsdocProblems('a.ts', source)).toEqual([
      'a.ts:1: JSDoc that only repeats the name checkCellCount: say the edge case or the reason',
      'a.ts:4: JSDoc that only repeats the name MILLISECONDS_PER_SECOND: say the edge case or the reason',
      'a.ts:9: JSDoc that only repeats the name ValueKind: say the edge case or the reason',
    ]);
  });

  it('accepts a JSDoc that says something the name does not, also in its second sentence only for the first one', () => {
    const source: string = [
      '/** Checks that a record has the number of cells of the table. */',
      'export function checkCellCount(): void {}',
      '/** Milliseconds of a minute, which never has a leap second in `Date`. */',
      'export const MILLISECONDS_PER_MINUTE: number = 60_000;',
      '/** Values of the `format` option. */',
      'export const DATE_FORMATS = [] as const;',
      'export function undocumented(): void {}',
    ].join('\n');
    expect(findNameOnlyJsdocProblems('a.ts', source)).toEqual([]);
  });
});
