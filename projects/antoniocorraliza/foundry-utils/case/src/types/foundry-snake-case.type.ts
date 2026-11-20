import type { KeyFrame } from './key-frame.type';
import type { KeyWords } from './key-words.type';
import type { SnakeWords } from './snake-words.type';

/** Computes the snake_case form of a key with the same rules as `toSnakeCase`. */
export type FoundrySnakeCase<Key extends string> = string extends Key
  ? string
  : KeyFrame<Key> extends [infer Leading extends string, infer Body extends string, infer Trailing extends string]
    ? `${Leading}${SnakeWords<KeyWords<Body>>}${Trailing}`
    : string;
