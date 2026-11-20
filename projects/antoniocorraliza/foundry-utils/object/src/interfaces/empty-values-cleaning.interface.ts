/** The choices of `removeEmptyValues`, read once from its options. */
export interface EmptyValuesCleaning {
  readonly removeEmptyStrings: boolean;
  readonly removeEmptyCollections: boolean;
  readonly removeEmptyArrayItems: boolean;
}
