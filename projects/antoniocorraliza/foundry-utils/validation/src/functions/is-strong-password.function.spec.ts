import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { isStrongPassword } from './is-strong-password.function';

describe('isStrongPassword', () => {
  it('asks for an upper-case letter, a lower-case letter and a digit of any script, and no symbol by default', () => {
    expect(isStrongPassword('ÁRBOLES1ñ')).toBe(true);
    expect(isStrongPassword('Password1')).toBe(true);
    expect(isStrongPassword('password1')).toBe(false);
    expect(isStrongPassword('PASSWORD1')).toBe(false);
    expect(isStrongPassword('Password')).toBe(false);
  });

  it('asks for 8 characters by default, counted by code points', () => {
    expect(isStrongPassword('Aa1aaaaa')).toBe(true);
    expect(isStrongPassword('Aa1aaaa')).toBe(false);
    expect(isStrongPassword('Aa1👨‍👩‍👧')).toBe(true);
    expect(isStrongPassword('Aa1👨‍👩‍👧', { minimumLength: 9 })).toBe(false);
  });

  it('asks for the given minimum length', () => {
    expect(isStrongPassword('Password1', { minimumLength: 12 })).toBe(false);
    expect(isStrongPassword('Password1234', { minimumLength: 12 })).toBe(true);
    expect(isStrongPassword('Aa1', { minimumLength: 1 })).toBe(true);
  });

  it('asks for a character that is not a letter, a digit or a space when a symbol is required', () => {
    expect(isStrongPassword('Password1', { requireSymbol: true })).toBe(false);
    expect(isStrongPassword('Password 1', { requireSymbol: true })).toBe(false);
    expect(isStrongPassword('Password1!', { requireSymbol: true })).toBe(true);
    expect(isStrongPassword('Password1€', { requireSymbol: true })).toBe(true);
  });

  it.each<unknown>([0, -1, 1.5, '12', null])('asks for 8 characters when the minimum length is %j', (minimumLength) => {
    expect(isStrongPassword('Aa1aaaaa', { minimumLength } as never)).toBe(true);
    expect(isStrongPassword('Aa1aaaa', { minimumLength } as never)).toBe(false);
  });

  it('ignores a minimum length passed as the second argument, as the old version took it', () => {
    expect(isStrongPassword('Password1', 12 as never)).toBe(true);
  });

  it('does not run a getter of its options', () => {
    const getter: () => boolean = vi.fn(() => true);
    expect(isStrongPassword('Password1', Object.defineProperty({}, 'requireSymbol', { get: getter, enumerable: true }))).toBe(true);
    expect(getter).not.toHaveBeenCalled();
  });

  it.each<unknown>([null, undefined, '', 12345678, ['Password1']])('returns false for %j', (value) => {
    expect(isStrongPassword(value)).toBe(false);
  });

  it('never throws', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (value, options) => {
        expect(typeof isStrongPassword(value, options as never)).toBe('boolean');
      }),
    );
  });
});
