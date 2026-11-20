/** Computes the result of `toCamelCaseKeys`: arrays and plain data objects in depth; anything else unchanged. */
export type FoundryCamelCaseKeys<T> = T extends never ? never : unknown;
