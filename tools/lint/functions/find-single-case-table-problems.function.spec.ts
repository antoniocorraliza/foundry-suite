import { describe, expect, it } from 'vitest';
import { findSingleCaseTableProblems } from './find-single-case-table-problems.function.ts';

describe('findSingleCaseTableProblems', () => {
  it('reports it.each, test.each and describe.each with a table of one case or none, also through a constant of the file', () => {
    const source: string = [
      "it.each([1])('reads %s', () => {});",
      "test.each([])('reads %s', () => {});",
      'const CASES = [[1, 2]] as const;',
      "describe.each(CASES)('through %s', () => {});",
    ].join('\n');
    expect(findSingleCaseTableProblems('a.spec.ts', source)).toEqual([
      'a.spec.ts:1: test table with 1 case(s): write it as a test without each',
      'a.spec.ts:2: test table with 0 case(s): write it as a test without each',
      'a.spec.ts:4: test table with 1 case(s): write it as a test without each',
    ]);
  });

  it('accepts tables of several cases, with modifiers, and tables it cannot count', () => {
    const source: string = [
      "it.each([1, 2])('reads %s', () => {});",
      "it.skip.each([1, 2])('reads %s', () => {});",
      "it.each([...OTHER])('reads %s', () => {});",
      "it.each(IMPORTED)('reads %s', () => {});",
      "list.each([1])('is not a test', () => {});",
    ].join('\n');
    expect(findSingleCaseTableProblems('a.spec.ts', source)).toEqual([]);
  });
});
