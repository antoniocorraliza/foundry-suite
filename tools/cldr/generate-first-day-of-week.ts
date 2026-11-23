import { writeFileSync } from 'node:fs';
import { FIRST_DAY_OF_WEEK_PATH } from './constants/cldr-settings.constant.ts';
import { createFirstDayOfWeekSource } from './functions/create-first-day-of-week-source.function.ts';
import { readCldrVersion } from './functions/read-cldr-version.function.ts';
import { readEngineFirstDay } from './functions/read-engine-first-day.function.ts';

function main(): number {
  const cldrVersion: string = readCldrVersion();
  writeFileSync(FIRST_DAY_OF_WEEK_PATH, createFirstDayOfWeekSource(readEngineFirstDay, cldrVersion));
  console.log(`[generate-first-day-of-week]: wrote ${FIRST_DAY_OF_WEEK_PATH} from CLDR ${cldrVersion}`);
  return 0;
}

process.exitCode = main();
