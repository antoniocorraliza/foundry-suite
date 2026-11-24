import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { isUrl } from './is-url.function';

describe('isUrl', () => {
  it('checks URLs with the shared reader of this entry', () => {
    expect(isUrl('https://www.empresa.es')).toBe(true);
    expect(isUrl('http://intranet')).toBe(false);
    expect(isUrl('https://banco.es@malo.es')).toBe(false);
    expect(isUrl('javascript:alert(1)')).toBe(false);
  });

  it('reads the options', () => {
    expect(isUrl('www.empresa.es', { allowMissingProtocol: true })).toBe(true);
    expect(isUrl('mailto:ana@empresa.es', { allowMissingProtocol: true })).toBe(false);
    expect(isUrl('http://empresa.es', { protocols: ['https:'] })).toBe(false);
    expect(isUrl('ftp://empresa.es', { protocols: ['ftp:'] })).toBe(true);
  });

  it.each<unknown>(['https:', [5], ['https:', null], { 0: 'https:' }])('uses the default protocols when protocols is %j', (protocols) => {
    expect(isUrl('http://empresa.es', { protocols } as never)).toBe(true);
    expect(isUrl('ftp://empresa.es', { protocols } as never)).toBe(false);
  });

  it.each<unknown>(['yes', 1, null])('does not allow a missing protocol when allowMissingProtocol is %j', (allowMissingProtocol) => {
    expect(isUrl('www.empresa.es', { allowMissingProtocol } as never)).toBe(false);
  });

  it('ignores a second argument that is not an object of options', () => {
    expect(['https://empresa.es', 'hola'].filter(isUrl as (value: unknown, index: number) => boolean)).toEqual(['https://empresa.es']);
    expect(isUrl('https://empresa.es', 'https:' as never)).toBe(true);
  });

  it('does not run a getter of its options', () => {
    const getter: () => boolean = vi.fn(() => true);
    expect(isUrl('www.empresa.es', Object.defineProperty({}, 'allowMissingProtocol', { get: getter, enumerable: true }))).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (value, options) => {
        expect(typeof isUrl(value, options as never)).toBe('boolean');
      }),
    );
  });
});
