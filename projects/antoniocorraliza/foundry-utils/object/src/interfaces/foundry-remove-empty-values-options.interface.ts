/** Options of `removeEmptyValues`: what it removes besides `null` and `undefined` properties. */
export interface FoundryRemoveEmptyValuesOptions {
  /** Removes empty strings too; `false` by default. */
  readonly removeEmptyStrings?: boolean;
  /** Removes arrays and plain objects that are empty after cleaning; `false` by default. */
  readonly removeEmptyCollections?: boolean;
  /** Removes `null` and `undefined` from inside arrays, which moves the positions; `false` by default. */
  readonly removeEmptyArrayItems?: boolean;
}
