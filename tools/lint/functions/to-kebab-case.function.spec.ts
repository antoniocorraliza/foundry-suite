import { describe, expect, it } from 'vitest';
import { toKebabCase } from './to-kebab-case.function.ts';

describe('toKebabCase', () => {
  it.each([
    ['getEntryFiles', 'get-entry-files'],
    ['FoundryKeyCollision', 'foundry-key-collision'],
    ['COMMIT_TYPES', 'commit-types'],
    ['IsAny', 'is-any'],
    ['sha256', 'sha256'],
    ['parseHTMLText', 'parse-html-text'],
  ])('turns %s into %s', (name, expected) => {
    expect(toKebabCase(name)).toBe(expected);
  });
});
