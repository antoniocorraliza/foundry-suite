import { describe, expect, it } from 'vitest';
import { findThrowsProblems } from './find-throws-problems.function.ts';

describe('findThrowsProblems', () => {
  it('accepts @throws on functions that can throw and is or has functions without it', () => {
    const source: string = [
      '/**',
      ' * Moves an item.',
      ' * @throws {RangeError} When an index is outside the array.',
      ' */',
      'export function moveArrayItem(): void {}',
      '/**',
      ' * Tells whether the value is empty.',
      ' */',
      'export function hasEmptyValue(): boolean {',
      '  return false;',
      '}',
    ].join('\n');
    expect(findThrowsProblems('a.ts', source)).toEqual([]);
  });

  it('rejects @throws on is and has functions and methods, also with the private prefix', () => {
    const source: string = [
      '/**',
      ' * Tells whether the value is a plain object.',
      ' * @throws {TypeError} Never.',
      ' */',
      'export function ɵisPlainObject(): boolean {',
      '  return false;',
      '}',
      'class Store {',
      '  /**',
      '   * Tells whether the key exists.',
      '   * @throws {TypeError} Never.',
      '   */',
      '  hasKey(): boolean {',
      '    return false;',
      '  }',
      '}',
    ].join('\n');
    expect(findThrowsProblems('a.ts', source)).toEqual([
      'a.ts:5: ɵisPlainObject never throws, so its JSDoc has no @throws',
      'a.ts:13: hasKey never throws, so its JSDoc has no @throws',
    ]);
  });

  it('accepts @throws on isSameDay, which compares two dates instead of guarding unvalidated data', () => {
    const source: string = [
      '/**',
      ' * Tells whether two dates fall on the same local day.',
      ' * @throws {RangeError} When a date is invalid or outside 1-9999.',
      ' */',
      'export function isSameDay(): boolean {',
      '  return false;',
      '}',
    ].join('\n');
    expect(findThrowsProblems('a.ts', source)).toEqual([]);
  });
});
