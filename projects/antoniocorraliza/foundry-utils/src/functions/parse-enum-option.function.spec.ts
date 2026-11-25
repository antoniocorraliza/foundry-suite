import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
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
      const error: unknown = catchThrown(() => ɵparseEnumOption({ options: { mode }, name: 'mode', allowedValues: MODES, fallback: null }));
      expect(error).toBeInstanceOf(TypeError);
      expect((error as TypeError).message).toBe(`[foundry-utils]: the mode option must be one of up, down, got ${String(mode)}`);
    },
  );

  it.each<[string, Readonly<Record<string, unknown>> | undefined]>([
    ['missing options', undefined],
    ['a missing option', {}],
    ['an undefined option', { mode: undefined }],
    ['a null option', { mode: null }],
  ])('throws a TypeError for %s when there is no fallback, naming the option', (_case, options) => {
    const error: unknown = catchThrown(() => ɵparseEnumOption({ options, name: 'mode', allowedValues: MODES }));
    expect(error).toBeInstanceOf(TypeError);
    expect((error as TypeError).message).toMatch(/^\[foundry-utils\]: .*\bmode\b/u);
  });
});
