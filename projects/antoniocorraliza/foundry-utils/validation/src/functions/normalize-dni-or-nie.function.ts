import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import { readDniOrNie } from './read-dni-or-nie.function';

/** Returns a Spanish DNI or NIE without separators and in upper case, or `null` when it is not valid. */
export function normalizeDniOrNie(value: unknown): string | null {
  return readDniOrNie(value, IDENTITY_DOCUMENT_KINDS);
}
