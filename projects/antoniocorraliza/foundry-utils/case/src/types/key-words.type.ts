type UnderscoreSeparators<Text extends string> = Text extends `${infer Before}-${infer After}`
  ? UnderscoreSeparators<`${Before}_${After}`>
  : Text extends `${infer Before} ${infer After}`
    ? UnderscoreSeparators<`${Before}_${After}`>
    : Text;

type SplitWords<Text extends string, Words extends ReadonlyArray<string> = []> = Text extends `${infer Word}_${infer Rest}`
  ? SplitWords<Rest, Word extends '' ? Words : [...Words, Word]>
  : Text extends ''
    ? Words
    : [...Words, Text];

/** Splits the body of a key into the words between its underscores, hyphens and spaces, without empty words. */
export type KeyWords<Body extends string> = SplitWords<UnderscoreSeparators<Body>>;
