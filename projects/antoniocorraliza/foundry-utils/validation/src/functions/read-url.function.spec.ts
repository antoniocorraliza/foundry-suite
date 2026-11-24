import { describe, expect, it } from 'vitest';
import type { UrlSettings } from '../interfaces/url-settings.interface';
import { readUrl } from './read-url.function';

const DEFAULTS: UrlSettings = { protocols: ['http:', 'https:'], allowMissingProtocol: false, defaultProtocol: 'https:' };

const WITHOUT_PROTOCOL: UrlSettings = { ...DEFAULTS, allowMissingProtocol: true };

describe('readUrl', () => {
  it.each<[string, string]>([
    ['https://www.empresa.es', 'https://www.empresa.es/'],
    ['http://empresa.es/a/b?c=1#d', 'http://empresa.es/a/b?c=1#d'],
    ['http://localhost', 'http://localhost/'],
    ['http://localhost:4200', 'http://localhost:4200/'],
    ['http://[::1]:8080', 'http://[::1]:8080/'],
    ['https://192.168.1.10', 'https://192.168.1.10/'],
  ])('reads %j with its host as the URL parser writes it', (text, url) => {
    expect(readUrl(text, DEFAULTS)).toBe(url);
  });

  it.each<string>([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<b>hola</b>',
    'foo:bar',
    'ftp://empresa.es',
    'mailto:ana@empresa.es',
  ])('returns null for %j, whose protocol is not http or https by default', (text) => {
    expect(readUrl(text, DEFAULTS)).toBeNull();
  });

  it.each<string>(['http://intranet', 'http://intranet:8080', 'https://empresa'])('returns null for %j, whose host has no dot', (text) => {
    expect(readUrl(text, DEFAULTS)).toBeNull();
  });

  it.each<string>(['https://banco.es@malo.es', 'https://usuario:clave@empresa.es', 'https://:clave@empresa.es'])(
    'returns null for %j, which carries credentials',
    (text) => {
      expect(readUrl(text, DEFAULTS)).toBeNull();
    },
  );

  it.each<string>(['https://em presa.es', 'https://em%20presa.es', 'https://em<presa.es', 'https://em%3Cpresa.es'])(
    'returns null for %j, whose host has a character that a domain does not allow, whatever the engine does with it',
    (text) => {
      expect(readUrl(text, DEFAULTS)).toBeNull();
    },
  );

  it('accepts an IPv4 address only when its four numbers are written', () => {
    expect(readUrl('http://1.2.3.4', DEFAULTS)).toBe('http://1.2.3.4/');
    expect(readUrl('http://1.2.3', DEFAULTS)).toBeNull();
    expect(readUrl('http://1.2', DEFAULTS)).toBeNull();
  });

  it('returns null for a host that ends with a dot', () => {
    expect(readUrl('https://empresa.es.', DEFAULTS)).toBeNull();
    expect(readUrl('https://empresa.es./ruta', DEFAULTS)).toBeNull();
  });

  it('removes the spaces around the text', () => {
    expect(readUrl(' https://empresa.es ', DEFAULTS)).toBe('https://empresa.es/');
    expect(readUrl('\nhttps://empresa.es\t', DEFAULTS)).toBe('https://empresa.es/');
  });

  it('returns the canonical form: lower-case scheme and host, punycode and a final slash', () => {
    expect(readUrl('HTTPS://WWW.Empresa.ES', DEFAULTS)).toBe('https://www.empresa.es/');
    expect(readUrl('https://españa.es', DEFAULTS)).toBe('https://xn--espaa-rta.es/');
  });

  it('reads a text without a scheme with the default protocol only when that is allowed', () => {
    expect(readUrl('www.empresa.es', DEFAULTS)).toBeNull();
    expect(readUrl('www.empresa.es', WITHOUT_PROTOCOL)).toBe('https://www.empresa.es/');
    expect(readUrl('empresa.es/contacto', WITHOUT_PROTOCOL)).toBe('https://empresa.es/contacto');
    expect(readUrl('www.empresa.es', { ...WITHOUT_PROTOCOL, defaultProtocol: 'http:' })).toBe('http://www.empresa.es/');
  });

  it('does not add a protocol to a text that already has a scheme', () => {
    expect(readUrl('mailto:ana@empresa.es', WITHOUT_PROTOCOL)).toBeNull();
    expect(readUrl('javascript:alert(1)', WITHOUT_PROTOCOL)).toBeNull();
  });

  it('returns null when the default protocol is not one of the accepted ones', () => {
    expect(readUrl('www.empresa.es', { protocols: ['https:'], allowMissingProtocol: true, defaultProtocol: 'http:' })).toBeNull();
  });

  it('accepts only the given protocols, compared in lower case', () => {
    expect(readUrl('http://empresa.es', { ...DEFAULTS, protocols: ['https:'] })).toBeNull();
    expect(readUrl('https://empresa.es', { ...DEFAULTS, protocols: ['HTTPS:'] })).toBe('https://empresa.es/');
  });

  it('never matches a protocol written without its colon, and accepts nothing with an empty list', () => {
    expect(readUrl('https://empresa.es', { ...DEFAULTS, protocols: ['https'] })).toBeNull();
    expect(readUrl('https://empresa.es', { ...DEFAULTS, protocols: [] })).toBeNull();
  });

  it.each<unknown>(['', '   ', 'https://em presa.es', 'https://', null, undefined, 5, new URL('https://empresa.es'), {}])(
    'returns null for %s',
    (value) => {
      expect(readUrl(value, DEFAULTS)).toBeNull();
    },
  );
});
