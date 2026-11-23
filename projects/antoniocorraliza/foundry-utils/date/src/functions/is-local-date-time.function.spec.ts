import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { runWithoutDate } from '@foundry-test/functions/run-without-date.function';
import { formatLocalDateTime } from './format-local-date-time.function';
import { isLocalDateTime } from './is-local-date-time.function';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

type UseLocalDateTime = (value: string) => unknown;

const NOT_CANONICAL_VALUES: ReadonlyArray<string> = [
  '2026-11-14 09:30',
  '2026-11-14T09:30:00',
  '2026-11-14t09:30',
  '2026-11-14T24:00',
  '2026-11-14T23:60',
  '2026-11-14T9:30',
  '2026-11-14T09:30Z',
  '2026-02-29T10:00',
  '0000-01-01T00:00',
  '10000-01-01T00:00',
  ' 2026-11-14T09:30',
  '2026-11-14',
  '',
];

const VALUE_USERS: ReadonlyArray<[string, UseLocalDateTime]> = [
  ['formatLocalDateTime', (value) => formatLocalDateTime(value, { format: 'eu' })],
  ['localDateTimeToDate', (value) => localDateTimeToDate(value)],
  ['localDateTimeToDate in UTC', (value) => localDateTimeToDate(value, { timeZone: 'utc' })],
];

const TEXT_FUNCTIONS: ReadonlyArray<[string, () => unknown]> = [
  ['isLocalDateTime', () => isLocalDateTime('2026-11-14T09:30')],
  ['parseLocalDateTime', () => parseLocalDateTime('14/11/2026 09:30', { format: 'eu' })],
  ['parseLocalDateTime with parts', () => parseLocalDateTime({ year: 2026, month: 11, day: 14, hours: 9, minutes: 30 })],
  ['formatLocalDateTime', () => formatLocalDateTime('2026-11-14T21:30', { format: 'us' })],
];

describe('isLocalDateTime', () => {
  it.each(['2026-11-14T09:30', '0001-01-01T00:00', '9999-12-31T23:59', '2024-02-29T12:00', '2026-03-29T02:30'])(
    'accepts the canonical value %j',
    (value) => {
      expect(isLocalDateTime(value)).toBe(true);
    },
  );

  it.each<unknown>([...NOT_CANONICAL_VALUES, null, undefined, 3, new String('2026-11-14T09:30'), new Date(2026, 10, 14)])(
    'rejects %j',
    (value) => {
      expect(isLocalDateTime(value)).toBe(false);
    },
  );

  it('filters a list without throwing and ignores the index', () => {
    expect(['2026-11-14T09:30', 3, null, '2026-11-14 09:30'].filter(isLocalDateTime)).toEqual(['2026-11-14T09:30']);
  });

  describe.each(VALUE_USERS)('as the canonical value of %s', (_name, useValue) => {
    it.each(NOT_CANONICAL_VALUES)('throws a RangeError for %j instead of reading it', (value) => {
      expect(catchThrown(() => useValue(value))).toBeInstanceOf(RangeError);
    });
  });

  it.each(TEXT_FUNCTIONS)('gives the same result through %s when Date is not available', (_name, useText) => {
    const expected: unknown = useText();
    expect(runWithoutDate(useText)).toEqual(expected);
  });
});
