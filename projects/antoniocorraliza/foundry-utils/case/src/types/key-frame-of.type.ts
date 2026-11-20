type LeadingUnderscores<Text extends string, Prefix extends string = ''> = Text extends `_${infer Rest}`
  ? LeadingUnderscores<Rest, `${Prefix}_`>
  : [Prefix, Text];

type TrailingUnderscores<Text extends string, Suffix extends string = ''> = Text extends `${infer Rest}_`
  ? TrailingUnderscores<Rest, `_${Suffix}`>
  : [Text, Suffix];

/** Splits a key into its leading underscores, its body and its trailing underscores. */
export type KeyFrameOf<Key extends string> =
  LeadingUnderscores<Key> extends [infer Leading extends string, infer Rest extends string]
    ? TrailingUnderscores<Rest> extends [infer Body extends string, infer Trailing extends string]
      ? [Leading, Body, Trailing]
      : never
    : never;
