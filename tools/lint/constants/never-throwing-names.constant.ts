/** Matches the functions and methods that never throw: `is...` and `has...`, also with the private prefix. */
export const NEVER_THROWING_NAME: RegExp = /^\u0275?(?:is|has)[A-Z]/;

/** Lists the `is...` functions that may throw, because they compare values instead of guarding unvalidated data. */
export const NEVER_THROWING_NAME_EXCEPTIONS: ReadonlyArray<string> = ['isSameDay'];
