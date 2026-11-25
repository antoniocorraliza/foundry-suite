import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { ɵparseBooleanOption } from './parse-boolean-option.function';

describe('ɵparseBooleanOption', () => {
  it('returns the value when it is a boolean', () => {
    expect(ɵparseBooleanOption({ options: { strict: true }, name: 'strict', fallback: false })).toBe(true);
    expect(ɵparseBooleanOption({ options: { strict: false }, name: 'strict', fallback: true })).toBe(false);
  });

  it('returns the fallback when the option is missing, undefined or null', () => {
    expect(ɵparseBooleanOption({ options: undefined, name: 'strict', fallback: true })).toBe(true);
    expect(ɵparseBooleanOption({ options: { strict: undefined }, name: 'strict', fallback: false })).toBe(false);
    expect(ɵparseBooleanOption({ options: { strict: null }, name: 'strict', fallback: false })).toBe(false);
  });

  it.each<unknown>([0, 1, 'true', {}])('throws a TypeError for %j, naming the option and the type of the value', (strict) => {
    const error: TypeError = catchError(() => ɵparseBooleanOption({ options: { strict }, name: 'strict', fallback: false }), TypeError);
    expect(error.message).toBe(`[foundry-utils]: the strict option must be a boolean, got ${typeof strict}`);
  });
});
