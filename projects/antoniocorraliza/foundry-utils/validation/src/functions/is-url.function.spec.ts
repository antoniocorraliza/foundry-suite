import { describe, expect, it, vi } from 'vitest';
import { PROTOCOLS_ACCEPTED_BY_DEFAULT } from '../constants/protocols-accepted-by-default.constant';
import { isUrl } from './is-url.function';
import { readUrl } from './read-url.function';

describe('isUrl', () => {
  it('accepts and rejects URLs as readUrl reads them', () => {
    const urls: ReadonlyArray<unknown> = [
      'https://www.empresa.es',
      'HTTPS://WWW.Empresa.ES',
      'http://intranet',
      'https://banco.es@malo.es',
      'javascript:alert(1)',
      'empresa.es',
      '',
      null,
    ];
    urls.forEach((url) =>
      expect(isUrl(url)).toBe(
        readUrl(url, { protocols: PROTOCOLS_ACCEPTED_BY_DEFAULT, allowMissingProtocol: false, defaultProtocol: 'https:' }) !== null,
      ),
    );
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

  it('does not run a getter of the allowMissingProtocol option', () => {
    const getter: () => boolean = vi.fn(() => true);
    expect(isUrl('www.empresa.es', Object.defineProperty({}, 'allowMissingProtocol', { get: getter, enumerable: true }))).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });
});
