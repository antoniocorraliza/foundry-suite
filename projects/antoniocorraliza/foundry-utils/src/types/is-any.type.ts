/** Tells whether a type is `any`; for internal use of the entries. */
export type ɵFoundryIsAny<T> = 0 extends 1 & T ? true : false;
