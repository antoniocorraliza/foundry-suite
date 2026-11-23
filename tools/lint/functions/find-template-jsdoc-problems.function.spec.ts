import { describe, expect, it } from 'vitest';
import { findTemplateJsdocProblems } from './find-template-jsdoc-problems.function.ts';

describe('findTemplateJsdocProblems', () => {
  it('rejects a declaration JSDoc that opens with a template verb, on one line or on several', () => {
    const source: string = [
      '/** Gives the first year that the date functions read. */',
      'export const MIN_YEAR: number = 1;',
      '',
      '/**',
      ' * Holds the parts of a day.',
      ' */',
      'export interface CivilDate {',
      '  readonly year: number;',
      '}',
    ].join('\n');
    expect(findTemplateJsdocProblems('a.ts', source)).toEqual([
      'a.ts:1: template JSDoc: describe a constant, type or interface with a noun phrase, not "Gives the..."',
      'a.ts:4: template JSDoc: describe a constant, type or interface with a noun phrase, not "Holds the..."',
    ]);
  });

  it('accepts noun phrases, computed types that open with a verb and the JSDoc of members', () => {
    const source: string = [
      '/** First year that the date functions read. */',
      'export const MIN_YEAR: number = 1;',
      '/** Tells whether a type is `any`. */',
      'export type IsAny<T> = 0 extends 1 & T ? true : false;',
      '/** Year, month and day of a day. */',
      'export interface CivilDate {',
      '  /** Lists nothing: members are checked by the review. */',
      '  readonly year: number;',
      '}',
    ].join('\n');
    expect(findTemplateJsdocProblems('a.ts', source)).toEqual([]);
  });
});
