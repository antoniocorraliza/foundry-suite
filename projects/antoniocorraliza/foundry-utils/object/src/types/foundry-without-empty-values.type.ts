import type { ɵIsAny, ɵIsKeptAsIs, ɵMaxTypeDepth } from '@antoniocorraliza/foundry-utils';

type WithoutEmptyValue<T, RemoveArrayItems extends boolean, Depth extends ReadonlyArray<unknown>> = T extends object
  ? Depth['length'] extends ɵMaxTypeDepth
    ? unknown
    : T extends ReadonlyArray<unknown>
      ? {
          [Index in keyof T]: RemoveArrayItems extends true
            ? FoundryWithoutEmptyValues<NonNullable<T[Index]>, RemoveArrayItems, [...Depth, unknown]>
            : FoundryWithoutEmptyValues<T[Index], RemoveArrayItems, [...Depth, unknown]>;
        }
      : ɵIsKeptAsIs<T> extends true
        ? T
        : {
            [Key in keyof T as Key extends symbol ? never : Key]?: FoundryWithoutEmptyValues<
              NonNullable<T[Key]>,
              RemoveArrayItems,
              [...Depth, unknown]
            >;
          }
  : T;

/** Computes the result of `removeEmptyValues`: optional properties without `null` or `undefined`, in depth. */
export type FoundryWithoutEmptyValues<T, RemoveArrayItems extends boolean = false, Depth extends ReadonlyArray<unknown> = []> =
  ɵIsAny<T> extends true ? T : unknown extends T ? unknown : WithoutEmptyValue<T, RemoveArrayItems, Depth>;
