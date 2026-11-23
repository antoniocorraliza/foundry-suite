import type { ConvertedKeys } from './converted-keys.type';

/**
 * Computes the result of `toSnakeCaseKeys`: arrays, plain objects and class instances without methods in depth, and anything
 * else unchanged. Class instances are typed as converted although at run time they are kept by reference.
 */
export type FoundrySnakeCaseKeys<T> = ConvertedKeys<T, 'snake'>;
