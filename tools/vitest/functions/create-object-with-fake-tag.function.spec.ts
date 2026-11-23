import { describe, expect, it } from 'vitest';
import { createObjectWithFakeTag } from './create-object-with-fake-tag.function.ts';

describe('createObjectWithFakeTag', () => {
  it('creates an object that only fakes the tag', () => {
    const fake: object = createObjectWithFakeTag('Map');
    expect(Object.prototype.toString.call(fake)).toBe('[object Map]');
    expect(fake instanceof Map).toBe(false);
    expect(Object.getPrototypeOf(fake)).not.toBe(Object.prototype);
  });
});
