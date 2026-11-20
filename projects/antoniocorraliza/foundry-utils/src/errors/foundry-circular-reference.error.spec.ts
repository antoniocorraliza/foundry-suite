import { describe, expect, it } from 'vitest';
import { FoundryCircularReferenceError } from './foundry-circular-reference.error';
import { FoundryUtilsError } from './foundry-utils.error';

describe('FoundryCircularReferenceError', () => {
  it('is a FoundryUtilsError with its own name', () => {
    const error: FoundryCircularReferenceError = new FoundryCircularReferenceError({ path: ['a'] });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FoundryCircularReferenceError');
  });

  it('exposes the path it receives', () => {
    expect(new FoundryCircularReferenceError({ path: ['items', 2, 'owner'] }).path).toEqual(['items', 2, 'owner']);
  });

  it('writes the path in the message as in JavaScript', () => {
    const error: FoundryCircularReferenceError = new FoundryCircularReferenceError({ path: ['items', 2, 'owner'] });
    expect(error.message).toMatch(/^\[foundry-utils\]: [^A-Z].*[^.]$/);
    expect(error.message).toContain('items[2].owner');
  });

  it('writes a key that is not an identifier with brackets and quotes', () => {
    expect(new FoundryCircularReferenceError({ path: ['user name', 0] }).message).toContain('["user name"][0]');
  });

  it('calls the empty path root in the message', () => {
    expect(new FoundryCircularReferenceError({ path: [] }).message).toContain('root');
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryCircularReferenceError({ path: [] }, { cause: original }).cause).toBe(original);
  });
});
