import type { ɵIsAny, ɵIsKeptAsIs, ɵIsLongerThan } from '@antoniocorraliza/foundry-utils';
import type { FoundryCamelCase } from './foundry-camel-case.type';
import type { FoundrySnakeCase } from './foundry-snake-case.type';
import type { KeyCase } from './key-case.type';

type ConvertedKey<Key, Case extends KeyCase> = Key extends string
  ? string extends Key
    ? string
    : ɵIsLongerThan<Key, 64> extends true
      ? string
      : Case extends 'camel'
        ? FoundryCamelCase<Key>
        : FoundrySnakeCase<Key>
  : Key extends number
    ? Key
    : never;

type ConvertedValue<T, Case extends KeyCase, Depth extends ReadonlyArray<unknown>> = T extends object
  ? Depth['length'] extends 16
    ? unknown
    : T extends ReadonlyArray<unknown>
      ? { [Index in keyof T]: ConvertedKeys<T[Index], Case, [...Depth, unknown]> }
      : ɵIsKeptAsIs<T> extends true
        ? T
        : { [Key in keyof T as ConvertedKey<Key, Case>]: ConvertedKeys<T[Key], Case, [...Depth, unknown]> }
  : T;

/** Computes the result of the key conversion of a value; shared by both directions. */
export type ConvertedKeys<T, Case extends KeyCase, Depth extends ReadonlyArray<unknown> = []> =
  ɵIsAny<T> extends true ? T : unknown extends T ? unknown : ConvertedValue<T, Case, Depth>;
