import { describe, expect, it } from 'vitest';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { formatLocalDateTime } from './format-local-date-time.function';
import { isLocalDateTime } from './is-local-date-time.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

const DAY_IN_MILLISECONDS: number = 86_400_000;

const FORMATS: ReadonlyArray<FoundryDateFormat> = ['iso', 'eu', 'us'];

const MAXIMUM_MISMATCHES: number = 10;

function listQuarterHours(): Array<string> {
  return Array.from(
    { length: 96 },
    (_entry, index) => `${String(Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`,
  );
}

describe('the local date and time texts on every quarter hour from 2020 to 2030', () => {
  it('read back what they write in every format, without depending on the time zone', () => {
    const first: number = Date.UTC(2020, 0, 1);
    const count: number = (Date.UTC(2030, 11, 31) - first) / DAY_IN_MILLISECONDS + 1;
    const days: Array<string> = Array.from({ length: count }, (_entry, index) =>
      new Date(first + index * DAY_IN_MILLISECONDS).toISOString().slice(0, 10),
    );
    const mismatches: Array<string> = [];
    days.some((day) =>
      listQuarterHours().some((time) => {
        const value: string = `${day}T${time}`;
        const unreadFormat: FoundryDateFormat | undefined = FORMATS.find(
          (format) => !isLocalDateTime(value) || parseLocalDateTime(formatLocalDateTime(value, { format }), { format }) !== value,
        );
        if (unreadFormat !== undefined) mismatches.push(`${value} in ${unreadFormat}`);
        return mismatches.length >= MAXIMUM_MISMATCHES;
      }),
    );
    expect(mismatches).toEqual([]);
  });
});
