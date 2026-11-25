/** Option that takes a boolean, and the options that hold it. */
export interface ParseBooleanOptionRequest {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly fallback: boolean;
}
