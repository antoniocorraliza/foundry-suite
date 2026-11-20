/** A key split into its leading underscores, its words and its trailing underscores. */
export interface KeyFrame {
  readonly leading: string;
  readonly words: ReadonlyArray<string>;
  readonly trailing: string;
}
