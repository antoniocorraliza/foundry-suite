import { describe, expect, it } from 'vitest';
import { findLibraryCommentProblems } from './find-library-comment-problems.function.ts';

function findProblemLines(source: string): Array<string> {
  return findLibraryCommentProblems('a.ts', source).map((problem) => problem.split(': ')[0] ?? '');
}

describe('findLibraryCommentProblems', () => {
  it('accepts JSDoc, section markers, pure annotations and directives with a reason', () => {
    const source: string = [
      '/** Stores the selected day. */',
      'export class Store {',
      '  // ACTIONS',
      '  /** Selects a day. */',
      '  select(): void {}',
      '  // GETTERS & SETTERS',
      '}',
      'const token = /* @__PURE__ */ create();',
      '// eslint-disable-next-line no-console -- the warning is the output of this function',
      'console.warn(token);',
      '// @ts-expect-error the second argument is missing on purpose',
      'call(1);',
    ].join('\n');
    expect(findProblemLines(source)).toEqual([]);
  });

  it('reports line and block comments wherever they are', () => {
    const source: string = [
      '// Explains the next line.',
      'export function read(): void {',
      '  /* a block comment */',
      '  call(); // trailing comment',
      '  // before the closing brace',
      '}',
      '// at the end of the file',
    ].join('\n');
    expect(findProblemLines(source)).toEqual(['a.ts:1', 'a.ts:3', 'a.ts:4', 'a.ts:5', 'a.ts:7']);
  });

  it('reports a section marker that is not in the list and directives without a reason', () => {
    const source: string = [
      '// HELPERS',
      '// eslint-disable-next-line no-console',
      'console.warn(1);',
      '// @ts-expect-error',
      'call(1);',
      '// eslint-disable no-console',
    ].join('\n');
    expect(findProblemLines(source)).toEqual(['a.ts:1', 'a.ts:2', 'a.ts:4', 'a.ts:6']);
  });

  it('ignores comment-like text inside strings and templates', () => {
    expect(findProblemLines("const url: string = 'https://example.com'; const text: string = `/* not a comment */`;")).toEqual([]);
  });
});
