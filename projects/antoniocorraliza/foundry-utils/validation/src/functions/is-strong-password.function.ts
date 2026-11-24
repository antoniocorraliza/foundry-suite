import { ɵreadBooleanOption, ɵreadIntegerOption } from '@antoniocorraliza/foundry-utils';

/** Tells whether a value is a password with an upper-case letter, a lower-case letter and a digit, long enough and with a symbol if asked. */
export function isStrongPassword(value: unknown, options?: { readonly minimumLength?: number; readonly requireSymbol?: boolean }): boolean {
  if (typeof value !== 'string') return false;
  const minimumLength: number = ɵreadIntegerOption({ options, name: 'minimumLength', minimum: 1, fallback: 8 });
  const isSymbolRequired: boolean = ɵreadBooleanOption({ options, name: 'requireSymbol', fallback: false });
  return (
    Array.from(value).length >= minimumLength &&
    /\p{Lu}/u.test(value) &&
    /\p{Ll}/u.test(value) &&
    /\p{Nd}/u.test(value) &&
    (!isSymbolRequired || /[^\p{L}\p{N}\s]/u.test(value))
  );
}
