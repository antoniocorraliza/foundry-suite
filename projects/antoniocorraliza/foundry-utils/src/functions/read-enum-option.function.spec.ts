import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { ɵreadEnumOption } from './read-enum-option.function';

const COUNTRIES: ReadonlyArray<'ES' | 'PT'> = ['ES', 'PT'];

describe('ɵreadEnumOption', () => {
  it('returns the value when it is in the list', () => {
    expect(ɵreadEnumOption({ options: { country: 'PT' }, name: 'country', allowedValues: COUNTRIES, fallback: null })).toBe('PT');
    expect(ɵreadEnumOption({ options: { country: 'ES' }, name: 'country', allowedValues: COUNTRIES, fallback: 'PT' })).toBe('ES');
  });

  it.each<unknown>([undefined, null, 5, 'ES', true, ['ES'], () => ({ country: 'ES' })])(
    'returns the fallback when the options are %j, which are not an object',
    (options) => {
      expect(ɵreadEnumOption({ options, name: 'country', allowedValues: COUNTRIES, fallback: null })).toBeNull();
    },
  );

  it.each<unknown>([undefined, null, 'es', 'FR', '', 1, true, {}, ['ES']])('returns the fallback for the value %j', (country) => {
    expect(ɵreadEnumOption({ options: { country }, name: 'country', allowedValues: COUNTRIES, fallback: 'PT' })).toBe('PT');
  });

  it('returns the fallback when the option is missing', () => {
    expect(ɵreadEnumOption({ options: {}, name: 'country', allowedValues: COUNTRIES, fallback: null })).toBeNull();
  });

  it('reads only own data properties, without running a getter', () => {
    const getter: () => string = vi.fn(() => {
      throw new Error('[spec]: the getter ran');
    });
    const withGetter: object = Object.defineProperty({}, 'country', { get: getter, enumerable: true });
    const inherited: object = Object.create({ country: 'ES' }) as object;
    expect(ɵreadEnumOption({ options: withGetter, name: 'country', allowedValues: COUNTRIES, fallback: null })).toBeNull();
    expect(ɵreadEnumOption({ options: inherited, name: 'country', allowedValues: COUNTRIES, fallback: null })).toBeNull();
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws, whatever the options are', () => {
    fc.assert(
      fc.property(fc.anything(), (options) => {
        expect(() => ɵreadEnumOption({ options, name: 'country', allowedValues: COUNTRIES, fallback: null })).not.toThrow();
        expect(() =>
          ɵreadEnumOption({ options: { country: options }, name: 'country', allowedValues: COUNTRIES, fallback: null }),
        ).not.toThrow();
      }),
    );
  });
});
