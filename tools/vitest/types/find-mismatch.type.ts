/** Check of one item of a walk, which describes the mismatch or returns `null` when the item matches. */
export type FindMismatch<T> = (item: T) => string | null;
