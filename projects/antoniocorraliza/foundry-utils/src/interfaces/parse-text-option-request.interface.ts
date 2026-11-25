/** Option that takes a text, and the options that hold it. Without a fallback, the option is required. */
export interface ParseTextOptionRequest<Fallback extends string | null = string> {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly fallback?: Fallback;
}
