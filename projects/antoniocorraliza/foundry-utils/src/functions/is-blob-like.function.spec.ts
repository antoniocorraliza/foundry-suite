import { describe, expect, it } from 'vitest';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { ɵisBlobLike } from './is-blob-like.function';

describe('ɵisBlobLike', () => {
  it('returns true for a Blob and a File', () => {
    expect(ɵisBlobLike(new Blob(['a']))).toBe(true);
    expect(ɵisBlobLike(new File(['a'], 'a.csv'))).toBe(true);
  });

  it('returns true for a value tagged as a Blob or a File, as one created in another context is', () => {
    expect(ɵisBlobLike(createObjectWithFakeTag('Blob'))).toBe(true);
    expect(ɵisBlobLike(createObjectWithFakeTag('File'))).toBe(true);
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['a text', 'a'],
    ['an ArrayBuffer', new ArrayBuffer(1)],
    ['a plain object', { size: 1, type: '' }],
  ])('returns false for %s', (_name, value) => {
    expect(ɵisBlobLike(value)).toBe(false);
  });
});
