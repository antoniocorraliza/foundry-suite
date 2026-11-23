import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

describe('public API of the date entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'addCalendarDays',
      'addDays',
      'compareCalendarDays',
      'compareDays',
      'endOfDay',
      'formatCalendarDay',
      'formatDate',
      'formatDuration',
      'formatLocalDateTime',
      'formatTime',
      'getCalendarDayParts',
      'getCalendarDaysBetween',
      'getCalendarMonthGrid',
      'getCalendarWeek',
      'getConsecutiveDays',
      'getDateParts',
      'getDaysInRange',
      'getFirstDayOfWeek',
      'getIsoWeek',
      'getIsoWeeksOfMonth',
      'getTodayCalendarDay',
      'getYearRange',
      'isCalendarDay',
      'isLocalDateTime',
      'isSameDay',
      'localDateTimeToDate',
      'parseCalendarDay',
      'parseDate',
      'parseLocalDateTime',
      'splitDuration',
      'startOfDay',
      'toCalendarDay',
      'toInstantRange',
      'toIsoStringWithOffset',
      'toLocalDateTime',
      'toUtcCalendarDateString',
    ]);
  });
});
