/** Which URLs `isUrl` and `normalizeUrl` accept. */
export interface FoundryUrlOptions {
  /** Accepted protocols, with their colon; `['http:', 'https:']` by default. */
  readonly protocols?: ReadonlyArray<string>;
  /** Whether a text without a scheme, such as `'www.example.com'`, is read with the default protocol; `false` by default. */
  readonly allowMissingProtocol?: boolean;
}
