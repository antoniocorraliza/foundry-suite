/** Describes an option that takes one value of a closed list, and the options that hold it. */
export interface EnumOptionRequest<Value extends string> {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly allowedValues: ReadonlyArray<Value>;
  readonly fallback: Value;
}
