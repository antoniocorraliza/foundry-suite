import { describe, expect, it, vi } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { ɵparseEnumOption } from './parse-enum-option.function';

const MODES: ReadonlyArray<'up' | 'down'> = ['up', 'down'];

describe('ɵparseEnumOption', () => {
  it('returns the value when it is in the list', () => {
    expect(ɵparseEnumOption({ options: { mode: 'down' }, name: 'mode', allowedValues: MODES, fallback: 'up' })).toBe('down');
    expect(ɵparseEnumOption({ options: { mode: 'up' }, name: 'mode', allowedValues: MODES })).toBe('up');
  });

  it('returns the fallback when the option is missing, undefined or null', () => {
    expect(ɵparseEnumOption({ options: undefined, name: 'mode', allowedValues: MODES, fallback: 'up' })).toBe('up');
    expect(ɵparseEnumOption({ options: {}, name: 'mode', allowedValues: MODES, fallback: 'down' })).toBe('down');
    expect(ɵparseEnumOption({ options: { mode: undefined }, name: 'mode', allowedValues: MODES, fallback: 'up' })).toBe('up');
    expect(ɵparseEnumOption({ options: { mode: null }, name: 'mode', allowedValues: MODES, fallback: 'down' })).toBe('down');
  });

  it('reads only own data properties, without running a getter', () => {
    const getter: () => unknown = vi.fn(() => 'down');
    const withGetter: Readonly<Record<string, unknown>> = Object.defineProperty({}, 'mode', { get: getter, enumerable: true });
    const inherited: Readonly<Record<string, unknown>> = Object.create({ mode: 'down' }) as Readonly<Record<string, unknown>>;
    expect(ɵparseEnumOption({ options: withGetter, name: 'mode', allowedValues: MODES, fallback: 'up' })).toBe('up');
    expect(ɵparseEnumOption({ options: inherited, name: 'mode', allowedValues: MODES, fallback: 'up' })).toBe('up');
    expect(getter).not.toHaveBeenCalled();
  });

  it('returns null when the fallback is null and the option is missing, undefined or null', () => {
    expect(ɵparseEnumOption({ options: undefined, name: 'mode', allowedValues: MODES, fallback: null })).toBeNull();
    expect(ɵparseEnumOption({ options: { mode: undefined }, name: 'mode', allowedValues: MODES, fallback: null })).toBeNull();
    expect(ɵparseEnumOption({ options: { mode: null }, name: 'mode', allowedValues: MODES, fallback: null })).toBeNull();
  });

  it('still returns the value when the fallback is null', () => {
    expect(ɵparseEnumOption({ options: { mode: 'down' }, name: 'mode', allowedValues: MODES, fallback: null })).toBe('down');
  });

  it.each<unknown>(['UP', 'sideways', '', 1, true, {}])(
    'throws a TypeError for %j, naming the option, its values and the value',
    (mode) => {
      const error: TypeError = catchError(
        () => ɵparseEnumOption({ options: { mode }, name: 'mode', allowedValues: MODES, fallback: null }),
        TypeError,
      );
      expect(error.message).toBe(`[foundry-utils]: the mode option must be one of up, down, got ${String(mode)}`);
    },
  );

  it.each<[string, Readonly<Record<string, unknown>> | undefined]>([
    ['missing options', undefined],
    ['a missing option', {}],
    ['an undefined option', { mode: undefined }],
    ['a null option', { mode: null }],
  ])('throws a TypeError for %s when there is no fallback, naming the option', (_case, options) => {
    const error: TypeError = catchError(() => ɵparseEnumOption({ options, name: 'mode', allowedValues: MODES }), TypeError);
    expect(error.message).toMatch(/^\[foundry-utils\]: .*\bmode\b/u);
  });
});
