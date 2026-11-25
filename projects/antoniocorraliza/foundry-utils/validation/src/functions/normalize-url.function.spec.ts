import { describe, expect, it } from 'vitest';
import { ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { DEFAULT_PROTOCOLS } from '../constants/default-protocols.constant';
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

  it.each<unknown>(['https:', [5], ['https:', null]])(
    'throws a TypeError for the protocols %j, which are not a list of texts',
    (protocols) => {
      expect(catchThrown(() => normalizeUrl('https://empresa.es', { protocols } as never))).toBeInstanceOf(TypeError);
    },
  );

  it('rejects an allowMissingProtocol that is not a boolean and an unknown defaultProtocol as the readers of the root do', () => {
    expect(catchError(() => normalizeUrl('https://empresa.es', { allowMissingProtocol: 'yes' } as never), TypeError).message).toBe(
      catchError(
        () => ɵparseBooleanOption({ options: { allowMissingProtocol: 'yes' }, name: 'allowMissingProtocol', fallback: false }),
        TypeError,
      ).message,
    );
    expect(catchError(() => normalizeUrl('https://empresa.es', { defaultProtocol: 'ftp:' } as never), TypeError).message).toBe(
      catchError(
        () => ɵparseEnumOption({ options: { defaultProtocol: 'ftp:' }, name: 'defaultProtocol', allowedValues: DEFAULT_PROTOCOLS }),
        TypeError,
      ).message,
    );
  });
});
