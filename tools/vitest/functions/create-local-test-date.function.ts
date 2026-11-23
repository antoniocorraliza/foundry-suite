/** Creates the local date of a `'YYYY-MM-DD'` day at a time, at noon unless told otherwise, also for the years 1 to 99. */
export function createLocalTestDate(day: string, hours: number = 12, minutes: number = 0): Date {
  const [year, month, dayOfMonth]: Array<number> = day.split('-').map(Number);
  const date: Date = new Date(2000, 0, 1, hours, minutes);
  date.setFullYear(year ?? 0, (month ?? 0) - 1, dayOfMonth ?? 0);
  return date;
}
