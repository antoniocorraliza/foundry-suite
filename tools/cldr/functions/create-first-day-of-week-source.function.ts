import { REGION_LETTERS } from '../constants/cldr-settings.constant.ts';

function listTwoLetterRegions(): Array<string> {
  const letters: Array<string> = [...REGION_LETTERS];
  return letters.flatMap((first) => letters.map((second) => `${first}${second}`));
}

export function createFirstDayOfWeekSource(readFirstDay: (region: string) => number | null, cldrVersion: string): string {
  const regions: Array<string> = listTwoLetterRegions();
  const rows: Array<string> = Array.from({ length: 7 }, (_entry, weekday) =>
    weekday === 1 ? '' : regions.filter((region) => readFirstDay(region) === weekday).join(''),
  );
  return [
    `/** Lists the regions whose week starts on each weekday, from Sunday (0) to Saturday (6), in CLDR ${cldrVersion}; Monday is the default. */`,
    'export const FIRST_DAY_OF_WEEK_REGIONS: ReadonlyArray<string> = [',
    ...rows.map((row) => `  '${row}',`),
    '];',
    '',
  ].join('\n');
}
