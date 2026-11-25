/** Alphabet of `createRandomCode` when the options give none: the Latin letters, upper case first, and the digits. */
export const DEFAULT_RANDOM_CODE_ALPHABET: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/** Longest code that `createRandomCode` returns, in code points. */
export const MAX_RANDOM_CODE_LENGTH: number = 1024;
/** Fewest characters of an alphabet of `createRandomCode`. */
export const MIN_ALPHABET_SIZE: number = 2;
/** Most characters of an alphabet of `createRandomCode`: one for each value of a byte. */
export const MAX_ALPHABET_SIZE: number = 256;
