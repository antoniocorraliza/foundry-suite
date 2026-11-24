import { describe, expect, it } from 'vitest';
import { formatNumber } from './format-number.function';

describe('formatNumber with the language data of Node', () => {
  it('writes the separators and the sign of each language', () => {
    expect(formatNumber(1234567.5, { locale: 'fr-FR' })).toBe('1 234 567,5');
    expect(formatNumber(-5, { locale: 'sv-SE' })).toBe('−5');
    expect(formatNumber(1234567.5, { locale: 'en-IN' })).toBe('12,34,567.5');
  });
});
