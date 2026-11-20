import { describe, expect, it } from 'vitest';
import { findOverloadSpacingProblems } from './find-overload-spacing-problems.function.ts';

describe('findOverloadSpacingProblems', () => {
  it('accepts one blank line between the overloads and before the implementation, with or without JSDoc', () => {
    const source: string = [
      '/**',
      ' * Reads a text.',
      ' */',
      'export function read(value: string): string;',
      '',
      '/**',
      ' * Reads a number.',
      ' */',
      'export function read(value: number): number;',
      '',
      'export function read(value: unknown): unknown {',
      '  return value;',
      '}',
      'class Store {',
      '  get(key: string): string;',
      '',
      '  get(key: string): unknown {',
      '    return key;',
      '  }',
      '}',
    ].join('\n');
    expect(findOverloadSpacingProblems('a.ts', source)).toEqual([]);
  });

  it('rejects overloads of functions and methods without a blank line between them', () => {
    const source: string = [
      'export function read(value: string): string;',
      'export function read(value: unknown): unknown {',
      '  return value;',
      '}',
      'class Store {',
      '  get(key: string): string;',
      '  /** Reads a value. */',
      '  get(key: string): unknown {',
      '    return key;',
      '  }',
      '}',
    ].join('\n');
    expect(findOverloadSpacingProblems('a.ts', source)).toEqual([
      'a.ts:2: overloads are separated by one blank line',
      'a.ts:7: overloads are separated by one blank line',
    ]);
  });
});
