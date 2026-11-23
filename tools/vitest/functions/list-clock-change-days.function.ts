function readLocalDay(time: number): string {
  const date: Date = new Date(time);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}

/** Lists the local days, as `'YYYY-MM-DD'`, around each change of the UTC offset of the process between two years. */
export function listClockChangeDays(firstYear: number, lastYear: number): Array<string> {
  const dayInMilliseconds: number = 86_400_000;
  const first: number = Date.UTC(firstYear, 0, 1);
  const last: number = Date.UTC(lastYear, 11, 31);
  const days: Set<string> = new Set<string>();
  Array.from({ length: (last - first) / dayInMilliseconds + 1 }, (_entry, index) => first + index * dayInMilliseconds)
    .filter((time) => new Date(time).getTimezoneOffset() !== new Date(time + dayInMilliseconds).getTimezoneOffset())
    .flatMap((time) => [time, time + dayInMilliseconds / 2, time + dayInMilliseconds])
    .forEach((time) => days.add(readLocalDay(time)));
  return [...days].sort();
}
