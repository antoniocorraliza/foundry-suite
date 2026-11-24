import { FALSE_WORDS, TRUE_WORDS } from '../constants/boolean-words.constant';

/** Returns the boolean that a value stands for, or `null` when it is not one of the known booleans, numbers or words. */
export function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value !== 'string') return null;
  const word: string = value.trim().toLowerCase();
  if (TRUE_WORDS.includes(word)) return true;
  return FALSE_WORDS.includes(word) ? false : null;
}
