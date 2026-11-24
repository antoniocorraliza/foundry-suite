/** Option that takes an integer within limits, and the options that hold it. Without a fallback, the option is required. */
export interface IntegerOptionRequest<Fallback extends number | null = number> {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly minimum: number;
  readonly maximum?: number;
  readonly fallback?: Fallback;
}
