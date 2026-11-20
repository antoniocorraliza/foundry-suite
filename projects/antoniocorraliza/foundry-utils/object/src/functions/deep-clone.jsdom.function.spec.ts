import { describe, expect, it } from 'vitest';
import { deepClone } from './deep-clone.function';
import { isPlainObject } from './is-plain-object.function';

describe('deepClone and isPlainObject with jsdom objects', () => {
  it('keeps a jsdom file by reference', () => {
    const doc: File = new File(['x'], 'a.txt');
    expect(deepClone({ doc }).doc).toBe(doc);
  });

  it('does not take a jsdom file for a plain object', () => {
    expect(isPlainObject(new File(['x'], 'a.txt'))).toBe(false);
    expect(isPlainObject(JSON.parse('{"a":1}'))).toBe(true);
  });
});
