import { REGION_LETTERS } from '../constants/cldr-settings.constant.ts';

function listTwoLetterRegions(): Array<string> {
  const letters: Array<string> = [...REGION_LETTERS];
  return letters.flatMap((first) => letters.map((second) => `${first}${second}`));
}

export function createFirstDayOfWeekSource(readFirstDay: (region: string) => number | null, cldrVersion: string): string {
  const rows: Array<string> = listTwoLetterRegions().flatMap((region) => {
    const firstDay: number | null = readFirstDay(region);
    return firstDay === null || firstDay === 1 ? [] : [`  ${region}: ${firstDay},`];
  });
  return [
    "import type { FoundryWeekday } from '../types/foundry-weekday.type';",
    '',
    `/** First day of the week of each region whose week does not start on Monday, in CLDR ${cldrVersion}. */`,
    'export const FIRST_DAY_OF_WEEK_BY_REGION: Readonly<Record<string, FoundryWeekday>> = {',
    ...rows,
    '};',
    '',
  ].join('\n');
}
