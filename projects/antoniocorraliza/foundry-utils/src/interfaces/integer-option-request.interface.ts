/** Option that takes an integer within limits, and the options that hold it. */
export interface IntegerOptionRequest {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly name: string;
  readonly minimum: number;
  readonly maximum?: number;
  readonly fallback?: number;
}
