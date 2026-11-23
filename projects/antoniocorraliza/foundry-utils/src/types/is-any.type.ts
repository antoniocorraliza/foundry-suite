/** Tells whether a type is `any`. */
export type ɵIsAny<T> = 0 extends 1 & T ? true : false;
