/** Options of `toCamelCaseKeys` and `toSnakeCaseKeys`. */
export interface FoundryKeyConversionOptions {
  /** What to do when two keys of the same object convert to the same key; `'error'` by default. */
  readonly onCollision?: 'error' | 'keepFirst' | 'keepLast';
}
