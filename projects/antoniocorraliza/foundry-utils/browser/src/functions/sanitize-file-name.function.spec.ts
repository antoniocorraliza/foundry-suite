import { describe, expect, it } from 'vitest';
import { sanitizeFileName } from './sanitize-file-name.function';

describe('sanitizeFileName', () => {
  it.each([
    ['Factura 2026/03.csv', 'Factura 2026-03.csv'],
    ['a:b*c?.txt', 'a-b-c-.txt'],
    ['a\\b"c<d>e|f.txt', 'a-b-c-d-e-f.txt'],
    ['a\u0000b\u001fc\u007fd\u0085e\u009f.txt', 'a-b-c-d-e-.txt'],
    ['Informe 2026/03?.csv', 'Informe 2026-03-.csv'],
  ])('replaces each forbidden or control character of %j with a hyphen, one by one', (fileName, sanitized) => {
    expect(sanitizeFileName(fileName)).toBe(sanitized);
  });

  it.each([
    ['informe. ', 'informe'],
    ['informe.csv...', 'informe.csv'],
    ['informe . . ', 'informe'],
    ['a?. ', 'a-'],
  ])('removes the final spaces and dots of %j after replacing', (fileName, sanitized) => {
    expect(sanitizeFileName(fileName)).toBe(sanitized);
  });

  it.each(['', '   ', '...', ' . . '])('writes download for %j, which is empty without its final spaces and dots', (fileName) => {
    expect(sanitizeFileName(fileName)).toBe('download');
  });

  it.each([
    ['CON.csv', '_CON.csv'],
    ['nul', '_nul'],
    ['Com1.txt', '_Com1.txt'],
    ['lpt9.tar.gz', '_lpt9.tar.gz'],
    ['PRN', '_PRN'],
    ['aux.', '_aux'],
    ['con. ', '_con'],
  ])('puts an underscore in front of %j, whose part before the first dot is a reserved name of Windows', (fileName, sanitized) => {
    expect(sanitizeFileName(fileName)).toBe(sanitized);
  });

  it.each(['CONSOLA.csv', 'com10.txt', 'lpt0.txt', 'COM¹.txt', 'CON .txt', 'mi CON.csv'])(
    'leaves %j as it is, because its part before the first dot is not a reserved name of the list',
    (fileName) => {
      expect(sanitizeFileName(fileName)).toBe(fileName);
    },
  );

  it('keeps the leading spaces and dots, the format characters and the length', () => {
    expect(sanitizeFileName('.env')).toBe('.env');
    expect(sanitizeFileName(' informe.csv')).toBe(' informe.csv');
    expect(sanitizeFileName('factura‮fdp.exe')).toBe('factura‮fdp.exe');
    expect(sanitizeFileName(`${'a'.repeat(300)}.csv`)).toBe(`${'a'.repeat(300)}.csv`);
  });
});
