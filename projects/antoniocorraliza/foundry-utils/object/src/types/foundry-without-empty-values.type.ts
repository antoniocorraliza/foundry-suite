/** Computes the result of `removeEmptyValues`: optional properties without `null` or `undefined`, in depth. */
export type FoundryWithoutEmptyValues<T, RemoveArrayItems extends boolean = false> = RemoveArrayItems extends boolean
  ? T extends never
    ? never
    : unknown
  : never;
