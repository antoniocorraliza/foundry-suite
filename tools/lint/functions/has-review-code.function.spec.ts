import { describe, expect, it } from 'vitest';
import { hasReviewCode } from './has-review-code.function.ts';

describe('hasReviewCode', () => {
  it.each([
    'CORE2-R1',
    'UTILS2-R23',
    'UI-C4',
    'UI2-R27',
    'CONJ-R1',
    'F-C1',
    'F-UI1',
    'PF-B2-1',
    'PF-INF3',
    'PF-EST-1',
    'DI-10',
    'R2',
    'U17',
    'PF1',
    'B1',
    'M11',
  ])('finds %s', (code) => {
    expect(hasReviewCode(`fixed in ${code}, see the notes`)).toBe(true);
  });

  it.each(['UTF-8', 'UTF-16', 'ISO-8601', 'ES2022', 'IPv4', 'IPv6', 'MD5', 'SHA-256', 'U+2212', 'V8', 'OFL-1.1', 'A1', 'F2', 'F12'])(
    'lets %s through',
    (name) => {
      expect(hasReviewCode(`reads ${name} correctly`)).toBe(false);
    },
  );

  it.each(['Node 24', 'ubuntu-24.04', 'TS2307', 'Angular 21', 'es2022', 'v1.26.66'])('lets %s through', (text) => {
    expect(hasReviewCode(text)).toBe(false);
  });

  it('still finds a code next to an exception', () => {
    expect(hasReviewCode('a UTF-8 BOM, as R3 asked')).toBe(true);
  });
});
