import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { ɵreadBooleanOption } from './read-boolean-option.function';

describe('ɵreadBooleanOption', () => {
  it('returns the value when it is a boolean', () => {
    expect(ɵreadBooleanOption({ options: { requireSymbol: true }, name: 'requireSymbol', fallback: false })).toBe(true);
    expect(ɵreadBooleanOption({ options: { requireSymbol: false }, name: 'requireSymbol', fallback: true })).toBe(false);
  });

  it.each<unknown>([undefined, null, 5, 'true', true, [true], () => ({ requireSymbol: true })])(
    'returns the fallback when the options are %j, which are not an object',
    (options) => {
      expect(ɵreadBooleanOption({ options, name: 'requireSymbol', fallback: false })).toBe(false);
    },
  );

  it.each<unknown>([undefined, null, 0, 1, 'true', {}, new Boolean(true)])('returns the fallback for the value %j', (requireSymbol) => {
    expect(ɵreadBooleanOption({ options: { requireSymbol }, name: 'requireSymbol', fallback: false })).toBe(false);
  });

  it('reads only own data properties, without running a getter', () => {
    const getter: () => boolean = vi.fn(() => {
      throw new Error('[spec]: the getter ran');
    });
    const withGetter: object = Object.defineProperty({}, 'requireSymbol', { get: getter, enumerable: true });
    const inherited: object = Object.create({ requireSymbol: true }) as object;
    expect(ɵreadBooleanOption({ options: withGetter, name: 'requireSymbol', fallback: false })).toBe(false);
    expect(ɵreadBooleanOption({ options: inherited, name: 'requireSymbol', fallback: false })).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws, whatever the options are', () => {
    fc.assert(
      fc.property(fc.anything(), (options) => {
        expect(() => ɵreadBooleanOption({ options, name: 'requireSymbol', fallback: false })).not.toThrow();
        expect(() => ɵreadBooleanOption({ options: { requireSymbol: options }, name: 'requireSymbol', fallback: false })).not.toThrow();
      }),
    );
  });
});
