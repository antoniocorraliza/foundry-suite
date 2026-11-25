import { APOSTROPHE_GROUP_CHARACTERS, SPACE_GROUP_CHARACTERS } from '../constants/decimal-text.constant';
import type { GroupSeparator } from '../types/group-separator.type';

/** Returns the group separator of `parseDecimal` for a character that `Intl` writes between groups, or `null` when it reads none. */
export function readGroupSeparator(character: string): GroupSeparator | null {
  if (character === '.' || character === ',') return character;
  if (SPACE_GROUP_CHARACTERS.includes(character)) return ' ';
  if (APOSTROPHE_GROUP_CHARACTERS.includes(character)) return "'";
  return null;
}
