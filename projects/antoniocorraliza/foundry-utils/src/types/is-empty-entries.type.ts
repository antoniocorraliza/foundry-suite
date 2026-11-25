/** Rule that tells whether an array or a plain object with own data entries counts as empty. */
export type IsEmptyEntries = (container: object, entries: ReadonlyArray<[string, unknown]>) => boolean;
