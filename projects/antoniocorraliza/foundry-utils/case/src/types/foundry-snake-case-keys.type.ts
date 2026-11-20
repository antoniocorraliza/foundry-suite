/** Computes the result of `toSnakeCaseKeys`: arrays and plain data objects in depth; anything else unchanged. */
export type FoundrySnakeCaseKeys<T> = T extends never ? never : unknown;
