export interface ProjectOptions {
  readonly name: string;
  readonly include: ReadonlyArray<string>;
  readonly exclude?: ReadonlyArray<string>;
}
