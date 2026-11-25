import { DNI_CONTROL_LETTERS, DNI_OR_NIE_PATTERN, NIE_PREFIXES } from '../constants/validation-patterns.constant';
import type { IdentityDocumentKind } from '../types/identity-document-kind.type';

/** Returns a DNI or NIE of the accepted kinds without separators and in upper case, or `null` when it is not valid. */
export function readDniOrNie(value: unknown, accept: ReadonlyArray<IdentityDocumentKind>): string | null {
  if (typeof value !== 'string') return null;
  const document: string = value.replace(/[\s.-]/gu, '').toUpperCase();
  const groups: Record<string, string | undefined> | undefined = DNI_OR_NIE_PATTERN.exec(document)?.groups;
  if (groups === undefined) return null;
  const niePrefix: string | undefined = groups['niePrefix'];
  if (!accept.includes(niePrefix === undefined ? 'dni' : 'nie')) return null;
  const number: number = Number(niePrefix === undefined ? groups['dniDigits'] : `${NIE_PREFIXES.indexOf(niePrefix)}${groups['nieDigits']}`);
  return DNI_CONTROL_LETTERS.charAt(number % 23) === groups['letter'] ? document : null;
}
