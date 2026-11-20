import type { KeyFrame } from '../interfaces/key-frame.interface';
import { splitKey } from './split-key.function';

function toCamelWord(word: string, isFirst: boolean): string {
  const base: string = word === word.toUpperCase() ? word.toLowerCase() : word;
  const first: string = base.charAt(0);
  return `${isFirst ? first.toLowerCase() : first.toUpperCase()}${base.slice(1)}`;
}

/** Converts one key to camelCase, keeping the underscores at both ends. */
export function toCamelCase(key: string): string {
  const frame: KeyFrame = splitKey(key);
  return `${frame.leading}${frame.words.map((word, index) => toCamelWord(word, index === 0)).join('')}${frame.trailing}`;
}
