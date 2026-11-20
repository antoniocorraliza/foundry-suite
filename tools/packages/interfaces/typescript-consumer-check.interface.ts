export interface TypescriptConsumerCheck {
  readonly compiler: string;
  readonly project: string;
  readonly expectedError: string | null;
}
