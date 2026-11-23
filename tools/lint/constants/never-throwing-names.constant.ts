export const NEVER_THROWING_NAME: RegExp = /^\u0275?(?:is|has)[A-Z]/;

// These is... functions compare values instead of guarding unvalidated data, so they may throw.
export const NEVER_THROWING_NAME_EXCEPTIONS: ReadonlyArray<string> = ['isSameDay'];
