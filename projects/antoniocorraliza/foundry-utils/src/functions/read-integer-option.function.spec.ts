import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { ɵreadIntegerOption } from './read-integer-option.function';

describe('ɵreadIntegerOption', () => {
  it('returns the value when it is an integer within the limits, both included', () => {
    expect(ɵreadIntegerOption({ options: { version: 1 }, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBe(1);
    expect(ɵreadIntegerOption({ options: { version: 8 }, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBe(8);
  });

  it('accepts any integer from the minimum when there is no maximum', () => {
    expect(ɵreadIntegerOption({ options: { minimumLength: 1000 }, name: 'minimumLength', minimum: 1, fallback: 8 })).toBe(1000);
  });

  it.each<unknown>([undefined, null, 5, '4', [4], () => ({ version: 4 })])(
    'returns the fallback when the options are %j, which are not an object',
    (options) => {
      expect(ɵreadIntegerOption({ options, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBeNull();
    },
  );

  it.each<unknown>([undefined, null, 0, 9, -1, 4.5, Number.NaN, Number.POSITIVE_INFINITY, '4', true, new Number(4)])(
    'returns the fallback for the value %j',
    (version) => {
      expect(ɵreadIntegerOption({ options: { version }, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBeNull();
      expect(ɵreadIntegerOption({ options: { minimumLength: version }, name: 'minimumLength', minimum: 1, fallback: 8 })).toBe(
        typeof version === 'number' && Number.isInteger(version) && version >= 1 ? version : 8,
      );
    },
  );

  it('reads only own data properties, without running a getter', () => {
    const getter: () => number = vi.fn(() => {
      throw new Error('[spec]: the getter ran');
    });
    const withGetter: object = Object.defineProperty({}, 'version', { get: getter, enumerable: true });
    const inherited: object = Object.create({ version: 4 }) as object;
    expect(ɵreadIntegerOption({ options: withGetter, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBeNull();
    expect(ɵreadIntegerOption({ options: inherited, name: 'version', minimum: 1, maximum: 8, fallback: null })).toBeNull();
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws, whatever the options are', () => {
    fc.assert(
      fc.property(fc.anything(), (options) => {
        expect(() => ɵreadIntegerOption({ options, name: 'version', minimum: 1, maximum: 8, fallback: null })).not.toThrow();
        expect(() =>
          ɵreadIntegerOption({ options: { version: options }, name: 'version', minimum: 1, maximum: 8, fallback: null }),
        ).not.toThrow();
      }),
    );
  });
});
