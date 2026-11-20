type CamelWord<Word extends string, IsFirst extends boolean> =
  Word extends Uppercase<Word>
    ? IsFirst extends true
      ? Lowercase<Word>
      : Capitalize<Lowercase<Word>>
    : IsFirst extends true
      ? Uncapitalize<Word>
      : Capitalize<Word>;

/** Joins the words of a key in camelCase. */
export type CamelWords<
  Words extends ReadonlyArray<string>,
  Joined extends string = '',
  IsFirst extends boolean = true,
> = Words extends readonly [infer Word extends string, ...infer Rest extends ReadonlyArray<string>]
  ? CamelWords<Rest, `${Joined}${CamelWord<Word, IsFirst>}`, false>
  : Joined;
