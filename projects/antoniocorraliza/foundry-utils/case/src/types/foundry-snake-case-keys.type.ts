import type { ConvertedKeys } from './converted-keys.type';

/** Computes the result of `toSnakeCaseKeys`: arrays and plain data objects in depth; anything else unchanged. */
export type FoundrySnakeCaseKeys<T> = ConvertedKeys<T, 'snake'>;
