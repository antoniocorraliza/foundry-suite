/** Lists the times of a day as `'HH:mm'`, from `'00:00'` and every given number of minutes. */
export function listTimesOfDay(stepInMinutes: number): Array<string> {
  return Array.from({ length: Math.ceil(1440 / stepInMinutes) }, (_entry, index) => index * stepInMinutes).map(
    (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
  );
}
