import { describe, expect, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import { parseDate } from './parse-date.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

type ReadTime = (text: string) => string | null;

interface TimeReader {
  readonly name: string;
  readonly read: ReadTime;
}

const READERS: ReadonlyArray<TimeReader> = [
  {
    name: 'parseDate',
    read: (text) => {
      const date: Date | null = parseDate(text);
      return date === null ? null : readWallClock(date).slice(0, 16);
    },
  },
  { name: 'parseLocalDateTime', read: (text) => parseLocalDateTime(text) },
];

describe('readTimeText', () => {
  describe.each(READERS)('through $name', ({ read }) => {
    it.each(['2026-11-14T09:30', '2026-11-14 09:30', '2026-11-14t09:30'])('reads the time of %j', (text) => {
      expect(read(text)).toBe('2026-11-14T09:30');
    });

    it.each(['2026-11-14T09:30:00', '2026-11-14T09:30:00.0', '2026-11-14T09:30:00.000', '2026-11-14T09:30:00.000000000'])(
      'reads %j, whose seconds are zero',
      (text) => {
        expect(read(text)).toBe('2026-11-14T09:30');
      },
    );

    it.each([
      '2026-11-14T24:00',
      '2026-11-14T23:60',
      '2026-11-14T09:30:60',
      '2026-11-14T9:30',
      '2026-11-14T09:3',
      '2026-11-14T09',
      '2026-11-14T',
      '2026-11-14T09:30:00.',
      '2026-11-14T09:30:00.0000000000',
      '2026-11-14T09.30',
      '2026-11-14  09:30',
    ])('gives null for %j, whose time is outside the format', (text) => {
      expect(read(text)).toBeNull();
    });
  });

  describe('through parseDate', () => {
    it.each([
      ['2026-11-14T09:30:15.9', '2026-11-14T09:30:15.900'],
      ['2026-11-14T09:30:15.12', '2026-11-14T09:30:15.120'],
      ['2026-11-14T09:30:15.999', '2026-11-14T09:30:15.999'],
      ['2026-11-14T09:30:15.123456', '2026-11-14T09:30:15.123'],
      ['2026-11-14T09:30:15.999999999', '2026-11-14T09:30:15.999'],
    ])('keeps up to three decimals of %j and truncates the rest', (text, expected) => {
      const date: Date | null = parseDate(text);
      expect(date === null ? null : readWallClock(date)).toBe(expected);
    });

    it('truncates the last millisecond of a day instead of rounding it into the next day', () => {
      expect(parseDate('2026-11-14T23:59:59.9999Z')?.toISOString()).toBe('2026-11-14T23:59:59.999Z');
    });

    it.each([
      ['2026-07-01T10:00:00Z', '2026-07-01T10:00:00.000Z'],
      ['2026-07-01T10:00:00z', '2026-07-01T10:00:00.000Z'],
      ['2026-07-01T10:00Z', '2026-07-01T10:00:00.000Z'],
      ['2026-07-01T10:00:00+02:00', '2026-07-01T08:00:00.000Z'],
      ['2026-07-01T10:00:00+0200', '2026-07-01T08:00:00.000Z'],
      ['2026-07-01T10:00:00+02', '2026-07-01T08:00:00.000Z'],
      ['2026-07-01T10:00:00-05:30', '2026-07-01T15:30:00.000Z'],
      ['2026-07-01T10:00:00-00:00', '2026-07-01T10:00:00.000Z'],
      ['2026-07-01T10:00:00+23:59', '2026-06-30T10:01:00.000Z'],
      ['2026-07-01 10:00:00.5+01:00', '2026-07-01T09:00:00.500Z'],
    ])('reads %j as the exact instant %s', (text, expected) => {
      expect(parseDate(text)?.toISOString()).toBe(expected);
    });

    it('ignores the time zone option when the text has its own', () => {
      expect(parseDate('2026-07-01T10:00:00+02:00', { timeZone: 'utc' })?.toISOString()).toBe('2026-07-01T08:00:00.000Z');
    });

    it.each([
      '2026-07-01T10:00:00+24:00',
      '2026-07-01T10:00:00+25:00',
      '2026-07-01T10:00:00+14:60',
      '2026-07-01T10:00:00+1',
      '2026-07-01T10:00:00+2:00',
      '2026-07-01T10:00:00 Z',
    ])('gives null for %j, whose offset is outside the format', (text) => {
      expect(parseDate(text)).toBeNull();
    });

    it.each(['2026-03-01Z', '2026-03-01+02:00', '2026-03-01z'])('gives null for %j, a day without a time but with a time zone', (text) => {
      expect(parseDate(text)).toBeNull();
    });
  });

  describe('through parseLocalDateTime', () => {
    it.each(['2026-11-14T09:30:15', '2026-11-14T09:30:00.001', '2026-11-14T09:30:59.999'])(
      'gives null for %j instead of truncating seconds that are not zero',
      (text) => {
        expect(parseLocalDateTime(text)).toBeNull();
      },
    );

    it.each(['2026-11-14T09:30Z', '2026-11-14T09:30:00+01:00', '2026-11-14T09:30-0500'])(
      'gives null for %j, which has a time zone',
      (text) => {
        expect(parseLocalDateTime(text)).toBeNull();
      },
    );
  });
});
