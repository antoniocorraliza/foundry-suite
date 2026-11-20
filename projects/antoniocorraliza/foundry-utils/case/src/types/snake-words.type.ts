type IsUpper<Character extends string> = Character extends Lowercase<Character> ? false : true;

type IsLower<Character extends string> = Character extends Uppercase<Character> ? false : true;

type StartsWord<Previous extends string, Character extends string, Rest extends string> = Previous extends ''
  ? false
  : IsUpper<Character> extends false
    ? false
    : IsUpper<Previous> extends false
      ? true
      : Rest extends `${infer Next}${string}`
        ? IsLower<Next>
        : false;

type SnakeWord<
  Text extends string,
  Previous extends string = '',
  Joined extends string = '',
> = Text extends `${infer Character}${infer Rest}`
  ? SnakeWord<Rest, Character, `${Joined}${StartsWord<Previous, Character, Rest> extends true ? '_' : ''}${Lowercase<Character>}`>
  : Joined;

/** Joins the words of a key in snake_case, splitting each word where its letter case changes. */
export type SnakeWords<Words extends ReadonlyArray<string>, Joined extends string = ''> = Words extends readonly [
  infer Word extends string,
  ...infer Rest extends ReadonlyArray<string>,
]
  ? SnakeWords<Rest, Joined extends '' ? SnakeWord<Word> : `${Joined}_${SnakeWord<Word>}`>
  : Joined;
