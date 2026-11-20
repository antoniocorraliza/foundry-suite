/** Computes the camelCase form of a key with the same rules as `toCamelCase`. */
export type FoundryCamelCase<Key extends string> = Key extends string ? string : never;
