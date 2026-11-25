import { APOSTROPHE_GROUP_CHARACTERS, SPACE_GROUP_CHARACTERS } from '../constants/decimal-text.constant';
import type { GroupSeparator } from '../types/group-separator.type';

/** Returns the characters that a separator of `parseDecimal` takes, as the source of a regular expression. */
export function getSeparatorPattern(separator: GroupSeparator): string {
  if (separator === '.') return '\\.';
  if (separator === ' ') return `[${SPACE_GROUP_CHARACTERS.join('')}]`;
  if (separator === "'") return `[${APOSTROPHE_GROUP_CHARACTERS.join('')}]`;
  return separator;
}
