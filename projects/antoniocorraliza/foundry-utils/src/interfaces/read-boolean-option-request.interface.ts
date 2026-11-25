/** Option of a function that never throws, which takes a boolean, and whatever was passed as its options. */
export interface ReadBooleanOptionRequest {
  readonly options: unknown;
  readonly name: string;
  readonly fallback: boolean;
}
