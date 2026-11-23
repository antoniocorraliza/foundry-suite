/** Finds, in order, the instants whose local clock shows a `'YYYY-MM-DDTHH:mm'` text, for years from 100 and offsets in quarter hours up to 14 hours. */
export function findInstantsWithWallClock(text: string): Array<number> {
  const quarterHourInMilliseconds: number = 900_000;
  const maximumOffsetInQuarterHours: number = 56;
  const parts: Array<number> = text.split(/[-T:]/).map(Number);
  const [year, month, day, hours, minutes]: Array<number> = parts;
  const naive: number = Date.UTC(year ?? 0, (month ?? 0) - 1, day ?? 0, hours ?? 0, minutes ?? 0);
  return Array.from(
    { length: 2 * maximumOffsetInQuarterHours + 1 },
    (_entry, index) => naive + (index - maximumOffsetInQuarterHours) * quarterHourInMilliseconds,
  ).filter((time) => {
    const date: Date = new Date(time);
    const localParts: Array<number> = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
    return date.getSeconds() === 0 && localParts.every((part, index) => part === parts[index]);
  });
}
