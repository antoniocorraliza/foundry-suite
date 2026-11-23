/** Tells whether a text type has more characters than the limit. */
export type ɵIsLongerThan<
  Text extends string,
  Limit extends number,
  Counted extends ReadonlyArray<unknown> = [],
> = Counted['length'] extends Limit
  ? Text extends ''
    ? false
    : true
  : Text extends `${string}${infer Rest}`
    ? ɵIsLongerThan<Rest, Limit, [...Counted, unknown]>
    : false;
