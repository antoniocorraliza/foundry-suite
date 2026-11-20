import { describe, expect, it } from 'vitest';
import { findSignatureProblems } from './find-signature-problems.function.ts';

const MESSAGE: string = 'signature on several lines: extract a named type for the parameters';

describe('findSignatureProblems', () => {
  it('accepts signatures on one line, with or without a decorator above', () => {
    const source: string = [
      'function clear(): void {}',
      'class Store {',
      '  @Input()',
      '  set value(value: string) {}',
      '  remove(key: string): void {}',
      '}',
      'const read = (key: string): string => key;',
    ].join('\n');
    expect(findSignatureProblems('a.ts', source)).toEqual([]);
  });

  it('reports a function, a method and an arrow constant split over several lines', () => {
    const source: string = [
      'function clear(',
      '  key: string,',
      '): void {}',
      'class Store {',
      '  remove(',
      '    key: string,',
      '  ): void {}',
      '}',
      'const read = (',
      '  key: string,',
      '): string => key;',
    ].join('\n');
    expect(findSignatureProblems('a.ts', source)).toEqual([`a.ts:1: ${MESSAGE}`, `a.ts:5: ${MESSAGE}`, `a.ts:9: ${MESSAGE}`]);
  });

  it('accepts a split signature in the public API of a library', () => {
    const source: string = [
      'export function formatTime(',
      '  value: Date,',
      '): string {}',
      'export const read = (',
      '  key: string,',
      '): string => key;',
      'export class FoundryApiError extends Error {',
      '  constructor(',
      '    message: string,',
      '  ) {}',
      '  format(',
      '    value: string,',
      '  ): string {}',
      '}',
    ].join('\n');
    expect(findSignatureProblems('projects/a/src/functions/format-time.function.ts', source)).toEqual([]);
  });

  it('reports a split signature that is not public in a library', () => {
    const source: string = [
      'function build(',
      '  value: Date,',
      '): string {}',
      'export function formatTime(value: Date): string {',
      '  const read = (',
      '    key: string,',
      '  ): string => key;',
      '}',
      'export class FoundryStore {',
      '  private remove(',
      '    key: string,',
      '  ): void {}',
      '  protected clear(',
      '    key: string,',
      '  ): void {}',
      '}',
      'class LocalStore {',
      '  remove(',
      '    key: string,',
      '  ): void {}',
      '}',
    ].join('\n');
    expect(findSignatureProblems('projects/a/src/functions/format-time.function.ts', source)).toEqual([
      `projects/a/src/functions/format-time.function.ts:1: ${MESSAGE}`,
      `projects/a/src/functions/format-time.function.ts:5: ${MESSAGE}`,
      `projects/a/src/functions/format-time.function.ts:10: ${MESSAGE}`,
      `projects/a/src/functions/format-time.function.ts:13: ${MESSAGE}`,
      `projects/a/src/functions/format-time.function.ts:18: ${MESSAGE}`,
    ]);
  });

  it('reports a split exported signature outside the libraries and in their specs', () => {
    const source: string = ['export function formatTime(', '  value: Date,', '): string {}'].join('\n');
    expect(findSignatureProblems('tools/a.ts', source)).toEqual([`tools/a.ts:1: ${MESSAGE}`]);
    expect(findSignatureProblems('projects/a/src/b.function.spec.ts', source)).toEqual([`projects/a/src/b.function.spec.ts:1: ${MESSAGE}`]);
  });

  it('ignores a body that spans several lines', () => {
    expect(findSignatureProblems('a.ts', 'function clear(): void {\n  return;\n}')).toEqual([]);
  });
});
