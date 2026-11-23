export const APIA_SPECS: string = '**/*.apia.*spec.ts';
export const LORD_HOWE_SPECS: string = '**/*.lord-howe.*spec.ts';
export const JSDOM_SPECS: string = '**/*.jsdom.*spec.ts';
export const NODE_ONLY_SPECS: string = '**/*.node.*spec.ts';
// Walking every minute or every day of the calendar takes about a minute per time zone, so these specs only run in the full level.
export const EXHAUSTIVE_SPECS: string = '**/*.exhaustive.*spec.ts';
export const EXHAUSTIVE_TEST_TIMEOUT: number = 600_000;
export const UTILS_BROWSER_SPECS: ReadonlyArray<string> = ['object/src/functions/deep-clone.function.spec.ts', 'date/src/**/*.spec.ts'];
