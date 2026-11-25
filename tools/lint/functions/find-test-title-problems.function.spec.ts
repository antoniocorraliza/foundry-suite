import { describe, expect, it } from 'vitest';
import { findTestTitleProblems } from './find-test-title-problems.function.ts';

describe('findTestTitleProblems', () => {
  it('accepts titles that describe behavior', () => {
    expect(findTestTitleProblems('a.spec.ts', "describe('parseDate', () => { it('reads UTF-8 input', () => {}); });")).toEqual([]);
  });

  it('reports a code in describe, it and test titles', () => {
    const source: string = "describe('R2 parsing', () => {\n  it('U17: parseDate', () => {});\n  test('PF-INF3 coverage', () => {});\n});";
    expect(findTestTitleProblems('a.spec.ts', source)).toEqual([
      'a.spec.ts:1: review code in a test title: R2 parsing',
      'a.spec.ts:2: review code in a test title: U17: parseDate',
      'a.spec.ts:3: review code in a test title: PF-INF3 coverage',
    ]);
  });

  it('reads it.each, modifiers, template literals and titles that Prettier moved to their own line', () => {
    const source: string = [
      "it.each([1])('R2 with %s', () => {});",
      'it.skip(`U17 ${name}`, () => {});',
      'it(',
      "  'a long title about CORE2-R1',",
      '  () => {},',
      ');',
    ].join('\n');
    expect(findTestTitleProblems('a.spec.ts', source).map((problem) => problem.split(': ')[0])).toEqual([
      'a.spec.ts:1',
      'a.spec.ts:2',
      'a.spec.ts:3',
    ]);
  });

  it.each<string>(['the design', 'loose reference', 'old version', 'of this entry'])(
    'reports a title with "%s", which tells how the code was made and not what the test checks',
    (phrase) => {
      expect(findTestTitleProblems('a.spec.ts', `it('works as ${phrase} says', () => {});`)).toEqual([
        `a.spec.ts:1: test title that tells how the code was made: works as ${phrase} says`,
      ]);
    },
  );

  it('ignores calls that are not tests', () => {
    expect(findTestTitleProblems('a.spec.ts', "expect(code('R2')).toBe(true);")).toEqual([]);
  });
});
