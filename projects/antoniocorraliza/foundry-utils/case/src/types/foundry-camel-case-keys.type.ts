import type { ConvertedKeys } from './converted-keys.type';

/**
 * Computes the result of `toCamelCaseKeys`: arrays, plain objects and class instances without methods in depth, and anything
 * else unchanged. Class instances are typed as converted although at run time they are kept by reference.
 */
export type FoundryCamelCaseKeys<T> = ConvertedKeys<T, 'camel'>;
