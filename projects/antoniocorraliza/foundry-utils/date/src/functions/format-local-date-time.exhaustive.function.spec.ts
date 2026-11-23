import { describe, expect, it } from 'vitest';
import { findMismatches } from '@foundry-test/functions/find-mismatches.function';
import { listDaysOfYears } from '@foundry-test/functions/list-days-of-years.function';
import { listTimesOfDay } from '@foundry-test/functions/list-times-of-day.function';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { formatLocalDateTime } from './format-local-date-time.function';
import { isLocalDateTime } from './is-local-date-time.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

const FORMATS: ReadonlyArray<FoundryDateFormat> = ['iso', 'eu', 'us'];

function findValueMismatch(value: string): string | null {
  const unreadFormat: FoundryDateFormat | undefined = FORMATS.find(
    (format) => !isLocalDateTime(value) || parseLocalDateTime(formatLocalDateTime(value, { format }), { format }) !== value,
  );
  return unreadFormat === undefined ? null : `${value} in ${unreadFormat}`;
}

describe('the local date and time texts on every quarter hour from 2020 to 2030', () => {
  it('read back what they write in every format, without depending on the time zone', () => {
    const values: Array<string> = listDaysOfYears(2020, 2030).flatMap((day) => listTimesOfDay(15).map((time) => `${day}T${time}`));
    expect(findMismatches(values, findValueMismatch)).toEqual([]);
  });
});
