/** Tells whether a text type has more characters than the limit; for internal use of the entries. */
export type ɵFoundryIsLongerThan<
  Text extends string,
  Limit extends number,
  Counted extends ReadonlyArray<unknown> = [],
> = Counted['length'] extends Limit
  ? Text extends ''
    ? false
    : true
  : Text extends `${infer First}${infer Rest}`
    ? First extends ''
      ? false
      : ɵFoundryIsLongerThan<Rest, Limit, [...Counted, unknown]>
    : false;
