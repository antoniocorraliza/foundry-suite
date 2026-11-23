import type { CivilDayVisitor } from '../types/civil-day-visitor.type.ts';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function formatCivilDay(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Calls the visitor for every day from 0001-01-01 to 9999-12-31, in order, as `'YYYY-MM-DD'` with its index and weekday. */
export function visitCivilDays(visitor: CivilDayVisitor): void {
  // Counts day by day on purpose: a reference that shared the arithmetic of the code it checks would share its mistakes.
  let year: number = 1;
  let month: number = 1;
  let day: number = 1;
  let index: number = 0;
  while (year <= 9999) {
    visitor(formatCivilDay(year, month, day), index, (index + 1) % 7);
    index++;
    day++;
    if (day > getDaysInMonth(year, month)) {
      day = 1;
      month++;
    }
    if (month > 12) {
      month = 1;
      year++;
    }
  }
}
