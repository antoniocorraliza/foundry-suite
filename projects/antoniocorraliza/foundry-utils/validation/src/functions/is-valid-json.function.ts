import { ɵreadBooleanOption } from '@antoniocorraliza/foundry-utils';

/** Tells whether a value is a text with valid JSON, or with an object or array when `requireObjectOrArray` is set. */
export function isValidJson(value: unknown, options?: { readonly requireObjectOrArray?: boolean }): boolean {
  if (typeof value !== 'string') return false;
  const isObjectOrArrayRequired: boolean = ɵreadBooleanOption({ options, name: 'requireObjectOrArray', fallback: false });
  try {
    const parsed: unknown = JSON.parse(value);
    return !isObjectOrArrayRequired || (typeof parsed === 'object' && parsed !== null);
  } catch {
    return false;
  }
}
