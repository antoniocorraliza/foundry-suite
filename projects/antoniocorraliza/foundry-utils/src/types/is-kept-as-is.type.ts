/** Tells whether the computed types of Utils leave a type unchanged: errors, functions and objects with a method. */
export type ɵFoundryIsKeptAsIs<T> = T extends Error | ((...values: never) => unknown)
  ? true
  : true extends { [Key in keyof T]-?: T[Key] extends (...values: never) => unknown ? true : false }[keyof T]
    ? true
    : false;
