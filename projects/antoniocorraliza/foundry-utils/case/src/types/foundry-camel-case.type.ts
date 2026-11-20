import type { CamelWords } from './camel-words.type';
import type { KeyFrame } from './key-frame.type';
import type { KeyWords } from './key-words.type';

/** Computes the camelCase form of a key with the same rules as `toCamelCase`. */
export type FoundryCamelCase<Key extends string> = string extends Key
  ? string
  : KeyFrame<Key> extends [infer Leading extends string, infer Body extends string, infer Trailing extends string]
    ? `${Leading}${CamelWords<KeyWords<Body>>}${Trailing}`
    : string;
