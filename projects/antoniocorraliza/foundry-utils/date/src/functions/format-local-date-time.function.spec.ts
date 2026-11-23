import { describe, expect, it } from 'vitest';
import { formatLocalDateTime } from './format-local-date-time.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

describe('formatLocalDateTime', () => {
  it.each([
    [{ format: 'eu' }, '14/11/2026 21:30'],
    [{ format: 'eu', separator: '.' }, '14.11.2026 21:30'],
    [{ format: 'us' }, '11/14/2026 21:30'],
    [{ format: 'iso' }, '2026-11-14T21:30'],
    [{}, '2026-11-14T21:30'],
  ] as const)('writes the value with %j as %j', (options, expected) => {
    expect(formatLocalDateTime('2026-11-14T21:30', options)).toBe(expected);
  });

  it('returns null for null', () => {
    expect(formatLocalDateTime(null)).toBeNull();
  });

  it.each(['iso', 'eu', 'us'] as const)('writes a text that parseLocalDateTime reads back in %s', (format) => {
    expect(parseLocalDateTime(formatLocalDateTime('0050-01-01T00:05', { format }), { format })).toBe('0050-01-01T00:05');
  });
});
