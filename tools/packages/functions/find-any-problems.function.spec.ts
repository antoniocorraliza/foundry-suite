import { describe, expect, it } from 'vitest';
import { createTarball } from './create-tarball.function.ts';
import { findAnyProblems } from './find-any-problems.function.ts';

describe('findAnyProblems', () => {
  it('reports the any keyword in a declaration file', () => {
    const files: Readonly<Record<string, string>> = {
      'types/a.d.ts': 'export declare const value: string;\nexport declare function read(input: any): void;',
    };
    expect(findAnyProblems(createTarball('foundry-utils', {}, files))).toEqual(['types/a.d.ts:2 uses `any`: input: any']);
  });

  it('ignores any inside comments and names', () => {
    const files: Readonly<Record<string, string>> = { 'types/a.d.ts': '/** Accepts any day. */\nexport declare const company: string;' };
    expect(findAnyProblems(createTarball('foundry-utils', {}, files))).toEqual([]);
  });
});
