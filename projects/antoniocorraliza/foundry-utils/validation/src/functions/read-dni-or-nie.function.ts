import { DNI_CONTROL_LETTERS, DNI_OR_NIE_PATTERN } from '../constants/validation-patterns.constant';

/** Returns a DNI or NIE of the accepted kinds without separators and in upper case, or `null` when it is not valid. */
export function readDniOrNie(value: unknown, accept: ReadonlyArray<'dni' | 'nie'>): string | null {
  if (typeof value !== 'string') return null;
  const document: string = value.replace(/[\s.-]/gu, '').toUpperCase();
  const match: RegExpExecArray | null = DNI_OR_NIE_PATTERN.exec(document);
  if (match === null) return null;
  const [, body = '', letter = '']: RegExpExecArray = match;
  const isNie: boolean = /^[XYZ]/u.test(body);
  if (!accept.includes(isNie ? 'nie' : 'dni')) return null;
  const number: number = Number(isNie ? `${'XYZ'.indexOf(body.charAt(0))}${body.slice(1)}` : body);
  return DNI_CONTROL_LETTERS.charAt(number % 23) === letter ? document : null;
}
