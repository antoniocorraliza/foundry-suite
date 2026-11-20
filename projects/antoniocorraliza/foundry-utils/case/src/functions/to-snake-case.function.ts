import type { KeyFrame } from '../interfaces/key-frame.interface';
import { splitKey } from './split-key.function';

function isUpper(character: string): boolean {
  return character !== character.toLowerCase();
}

function isLower(character: string): boolean {
  return character !== character.toUpperCase();
}

function isWordStart(previous: string | undefined, character: string, next: string | undefined): boolean {
  if (previous === undefined || !isUpper(character)) return false;
  return !isUpper(previous) || (next !== undefined && isLower(next));
}

function toSnakeWord(word: string): string {
  const characters: Array<string> = word.split('');
  return characters
    .map(
      (character, index) => `${isWordStart(characters[index - 1], character, characters[index + 1]) ? '_' : ''}${character.toLowerCase()}`,
    )
    .join('');
}

/** Converts one key to snake_case, keeping the underscores at both ends. */
export function toSnakeCase(key: string): string {
  const frame: KeyFrame = splitKey(key);
  return `${frame.leading}${frame.words.map(toSnakeWord).join('_')}${frame.trailing}`;
}
