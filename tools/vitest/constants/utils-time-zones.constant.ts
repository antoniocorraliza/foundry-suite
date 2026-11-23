export const UTILS_TIME_ZONES: ReadonlyArray<string> = ['Europe/Madrid', 'America/Mexico_City', 'America/Santiago', 'UTC'];
export const UTILS_ZONED_FOLDERS: ReadonlyArray<string> = ['date'];
// Walking every minute or every day of the calendar takes about a minute per time zone, so these specs only run in the full level.
export const UTILS_EXHAUSTIVE_SPECS: string = '**/*.exhaustive.*spec.ts';
export const UTILS_EXHAUSTIVE_TEST_TIMEOUT: number = 600_000;
