import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { PROTOCOLS_ACCEPTED_BY_DEFAULT } from '../constants/protocols-accepted-by-default.constant';
import { normalizeUrl } from './normalize-url.function';
import { readUrl } from './read-url.function';

describe('normalizeUrl', () => {
  it('returns URLs as readUrl writes them, or null', () => {
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
      expect(normalizeUrl(url)).toBe(
        readUrl(url, { protocols: PROTOCOLS_ACCEPTED_BY_DEFAULT, allowMissingProtocol: false, defaultProtocol: 'https:' }),
      ),
    );
  });

  it('adds https to a text without a scheme only when a missing protocol is allowed', () => {
    expect(normalizeUrl('www.empresa.es')).toBeNull();
    expect(normalizeUrl('www.empresa.es', { allowMissingProtocol: true })).toBe('https://www.empresa.es/');
  });

  it('adds the default protocol that it is given', () => {
    expect(normalizeUrl('www.empresa.es', { allowMissingProtocol: true, defaultProtocol: 'http:' })).toBe('http://www.empresa.es/');
  });

  it('uses the default protocol only with allowMissingProtocol, and only when it is accepted', () => {
    expect(normalizeUrl('www.empresa.es', { defaultProtocol: 'http:' })).toBeNull();
    expect(normalizeUrl('www.empresa.es', { allowMissingProtocol: true, defaultProtocol: 'http:', protocols: ['https:'] })).toBeNull();
  });

  it('takes null options as their defaults', () => {
    expect(normalizeUrl('https://empresa.es', { protocols: null, allowMissingProtocol: null, defaultProtocol: null } as never)).toBe(
      'https://empresa.es/',
    );
  });

  it.each<unknown>([
    { protocols: 'https:' },
    { protocols: [5] },
    { protocols: ['https:', null] },
    { allowMissingProtocol: 'yes' },
    { defaultProtocol: 'ftp:' },
    { defaultProtocol: 'https' },
  ])('throws a TypeError for the options %j', (options) => {
    expect(catchThrown(() => normalizeUrl('https://empresa.es', options as never))).toBeInstanceOf(TypeError);
  });
});
