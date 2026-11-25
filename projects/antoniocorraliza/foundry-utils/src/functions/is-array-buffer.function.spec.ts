import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { ɵisArrayBuffer } from './is-array-buffer.function';

describe('ɵisArrayBuffer', () => {
  it('returns true for an ArrayBuffer of this context and of another one', () => {
    expect(ɵisArrayBuffer(new ArrayBuffer(2))).toBe(true);
    expect(ɵisArrayBuffer(runInNewContext('new ArrayBuffer(2)'))).toBe(true);
  });

  it.each<[string, unknown]>([
    ['an object that fakes the tag', createObjectWithFakeTag('ArrayBuffer')],
    ['a view', new Uint8Array(2)],
    ['a text', 'ArrayBuffer'],
    ['null', null],
  ])('returns false for %s', (_name, value) => {
    expect(ɵisArrayBuffer(value)).toBe(false);
  });
});
