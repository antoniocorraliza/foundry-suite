import { describe, expect, it } from 'vitest';
import { FoundryUtilsError } from './foundry-utils.error';

describe('FoundryUtilsError', () => {
  it('is an Error with its own name and the given message', () => {
    const error: FoundryUtilsError = new FoundryUtilsError('[foundry-utils]: something failed');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryUtilsError');
    expect(error.message).toBe('[foundry-utils]: something failed');
  });

  it('has no cause when none is given', () => {
    expect(Object.hasOwn(new FoundryUtilsError('[foundry-utils]: something failed'), 'cause')).toBe(false);
  });

  it('keeps the original error as its cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryUtilsError('[foundry-utils]: something failed', { cause: original }).cause).toBe(original);
  });

  it('keeps an explicit undefined cause, as Error does', () => {
    const error: FoundryUtilsError = new FoundryUtilsError('[foundry-utils]: something failed', { cause: undefined });
    expect('cause' in error).toBe(true);
    expect(error.cause).toBeUndefined();
  });
});
