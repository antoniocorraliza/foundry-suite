/** Finds, in order, the instants whose local clock shows a `'YYYY-MM-DDTHH:mm'` text, for years from 100 and offsets of whole hours up to 14. */
export function findInstantsWithWallClock(text: string): Array<number> {
  const hourInMilliseconds: number = 3_600_000;
  const parts: Array<number> = text.split(/[-T:]/).map(Number);
  const [year, month, day, hours, minutes]: Array<number> = parts;
  const naive: number = Date.UTC(year ?? 0, (month ?? 0) - 1, day ?? 0, hours ?? 0, minutes ?? 0);
  return Array.from({ length: 29 }, (_entry, index) => naive + (index - 14) * hourInMilliseconds).filter((time) => {
    const date: Date = new Date(time);
    const localParts: Array<number> = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
    return date.getSeconds() === 0 && localParts.every((part, index) => part === parts[index]);
  });
}
