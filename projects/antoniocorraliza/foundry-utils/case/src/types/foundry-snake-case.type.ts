/** Computes the snake_case form of a key with the same rules as `toSnakeCase`. */
export type FoundrySnakeCase<Key extends string> = Key extends string ? string : never;
