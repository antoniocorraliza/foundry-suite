import { describe, expect, it, vi } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { ɵparseTextOption } from './parse-text-option.function';

describe('ɵparseTextOption', () => {
  it('returns the value when it is a text, also an empty one', () => {
    expect(ɵparseTextOption({ options: { locale: 'es-ES' }, name: 'locale' })).toBe('es-ES');
    expect(ɵparseTextOption({ options: { suffix: '' }, name: 'suffix', fallback: '...' })).toBe('');
    expect(ɵparseTextOption({ options: { suffix: '...' }, name: 'suffix', fallback: null })).toBe('...');
  });

  it('returns the fallback when the option is missing, undefined or null', () => {
    expect(ɵparseTextOption({ options: undefined, name: 'fallback', fallback: '' })).toBe('');
    expect(ɵparseTextOption({ options: {}, name: 'suffix', fallback: '...' })).toBe('...');
    expect(ɵparseTextOption({ options: { suffix: undefined }, name: 'suffix', fallback: '...' })).toBe('...');
    expect(ɵparseTextOption({ options: { suffix: null }, name: 'suffix', fallback: '...' })).toBe('...');
  });

  it('reads only own data properties, without running a getter', () => {
    const getter: () => unknown = vi.fn(() => 'es-ES');
    const withGetter: Readonly<Record<string, unknown>> = Object.defineProperty({}, 'locale', { get: getter, enumerable: true });
    const inherited: Readonly<Record<string, unknown>> = Object.create({ locale: 'es-ES' }) as Readonly<Record<string, unknown>>;
    expect(ɵparseTextOption({ options: withGetter, name: 'locale', fallback: 'en-US' })).toBe('en-US');
    expect(ɵparseTextOption({ options: inherited, name: 'locale', fallback: 'en-US' })).toBe('en-US');
    expect(getter).not.toHaveBeenCalled();
  });

  it('returns null when the fallback is null and the option is missing, undefined or null', () => {
    expect(ɵparseTextOption({ options: undefined, name: 'locale', fallback: null })).toBeNull();
    expect(ɵparseTextOption({ options: { locale: undefined }, name: 'locale', fallback: null })).toBeNull();
    expect(ɵparseTextOption({ options: { locale: null }, name: 'locale', fallback: null })).toBeNull();
  });

  it.each<unknown>([5, true, {}, ['es-ES'], new String('es-ES')])(
    'throws a TypeError for %j, naming the option and the type of the value',
    (locale) => {
      const error: TypeError = catchError(() => ɵparseTextOption({ options: { locale }, name: 'locale', fallback: null }), TypeError);
      expect(error.message).toBe(`[foundry-utils]: the locale option must be a string, got ${typeof locale}`);
    },
  );

  it.each<[string, Readonly<Record<string, unknown>> | undefined]>([
    ['missing options', undefined],
    ['a missing option', {}],
    ['an undefined option', { currency: undefined }],
    ['a null option', { currency: null }],
  ])('throws a TypeError for %s when there is no fallback', (_case, options) => {
    const error: TypeError = catchError(() => ɵparseTextOption({ options, name: 'currency' }), TypeError);
    expect(error.message).toMatch(/^\[foundry-utils\]: the currency option must be a string, got null$/u);
  });
});
