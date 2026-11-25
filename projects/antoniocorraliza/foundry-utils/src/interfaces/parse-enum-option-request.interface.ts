/** Option that takes one value of a closed list, and the options that hold it. Without a fallback, the option is required. */
export interface ParseEnumOptionRequest<Value extends string, Fallback extends Value | null = Value> {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly allowedValues: ReadonlyArray<Value>;
  readonly fallback?: Fallback;
}
