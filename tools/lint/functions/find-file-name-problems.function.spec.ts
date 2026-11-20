import { describe, expect, it } from 'vitest';
import { findFileNameProblems } from './find-file-name-problems.function.ts';

describe('findFileNameProblems', () => {
  it('accepts a file named after what it exports, without the private prefix and the suffix of its folder', () => {
    expect(findFileNameProblems('tools/size/functions/get-entry-files.function.ts', 'export function getEntryFiles(): void {}')).toEqual(
      [],
    );
    expect(findFileNameProblems('tools/ci/constants/commit-types.constant.ts', 'export const COMMIT_TYPES: number = 1;')).toEqual([]);
    expect(
      findFileNameProblems(
        'projects/a/case/src/errors/foundry-key-collision.error.ts',
        'export class FoundryKeyCollisionError extends Error {}',
      ),
    ).toEqual([]);
    expect(findFileNameProblems('projects/a/src/types/is-any.type.ts', 'export type ɵIsAny<T> = T;')).toEqual([]);
    expect(
      findFileNameProblems(
        'projects/a/storage/src/providers/provide-foundry-storage.provider.ts',
        'export function provideFoundryStorage(): void {}',
      ),
    ).toEqual([]);
    expect(findFileNameProblems('projects/a/src/constants/week-start.cldr.constant.ts', 'export const WEEK_START: number = 1;')).toEqual(
      [],
    );
  });

  it('counts the overloads of a function as one name', () => {
    const source: string = [
      'export function read(value: string): string;',
      '',
      'export function read(value: unknown): unknown {',
      '  return value;',
      '}',
    ].join('\n');
    expect(findFileNameProblems('tools/a/functions/read.function.ts', source)).toEqual([]);
  });

  it('rejects a file whose name is not the exported name', () => {
    expect(findFileNameProblems('tools/size/functions/entry-files.function.ts', 'export function getEntryFiles(): void {}')).toEqual([
      'tools/size/functions/entry-files.function.ts: the file is named after what it exports: get-entry-files.function.ts',
    ]);
  });

  it('rejects a file that exports several names or none', () => {
    const source: string = 'export const FIRST: number = 1;\nexport const SECOND: number = 2;';
    expect(findFileNameProblems('tools/ci/constants/first.constant.ts', source)).toEqual([
      'tools/ci/constants/first.constant.ts: a file exports one name, and this one exports 2 (FIRST, SECOND)',
    ]);
    expect(findFileNameProblems('tools/ci/constants/first.constant.ts', 'const FIRST: number = 1;')).toHaveLength(1);
  });

  it('rejects the Foundry prefix in an internal name', () => {
    expect(findFileNameProblems('projects/a/src/types/foundry-kind.type.ts', 'export type ɵFoundryKind = string;')).toEqual([
      'projects/a/src/types/foundry-kind.type.ts: an internal name with the private prefix does not take Foundry: ɵFoundryKind',
    ]);
  });

  it('skips tests, declaration files and files outside the folders by kind', () => {
    const source: string = 'export const FIRST: number = 1;\nexport const SECOND: number = 2;';
    expect(findFileNameProblems('tools/ci/functions/first.function.spec.ts', source)).toEqual([]);
    expect(findFileNameProblems('tools/vitest/provided-context.d.ts', source)).toEqual([]);
    expect(findFileNameProblems('projects/a/src/public-api.ts', source)).toEqual([]);
  });
});
