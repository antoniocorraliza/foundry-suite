/** Tells whether a type is `any`, the only type whose intersection with `1` still accepts `0`. */
export type ɵIsAny<T> = 0 extends 1 & T ? true : false;
