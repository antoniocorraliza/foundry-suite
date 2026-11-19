export interface BundleRequest {
  readonly source: string;
  readonly resolveDirectory: string;
  readonly entryFiles: ReadonlyMap<string, string>;
}
