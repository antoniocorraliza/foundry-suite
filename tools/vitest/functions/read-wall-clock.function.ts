function padNumber(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

/** Reads the local clock of a date as `'YYYY-MM-DDTHH:mm:ss.sss'`, with the year in four digits, or returns `null` for `null`. */
export function readWallClock(date: Date): string;

export function readWallClock(date: Date | null): string | null;

export function readWallClock(date: Date | null): string | null {
  if (date === null) return null;
  const day: string = `${padNumber(date.getFullYear(), 4)}-${padNumber(date.getMonth() + 1, 2)}-${padNumber(date.getDate(), 2)}`;
  const time: string = `${padNumber(date.getHours(), 2)}:${padNumber(date.getMinutes(), 2)}:${padNumber(date.getSeconds(), 2)}`;
  return `${day}T${time}.${padNumber(date.getMilliseconds(), 3)}`;
}
