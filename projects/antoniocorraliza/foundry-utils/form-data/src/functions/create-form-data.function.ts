import type { FoundryFormDataEntries } from '../types/foundry-form-data-entries.type';

/**
 * Creates a FormData of the environment with one part per value and per element of a list, in the order of `Object.keys`.
 * `null` and `undefined` are left out.
 * @throws {TypeError} When the entries or the options are not valid, or a value cannot be sent in a form, with its key.
 */
export function createFormData(entries: FoundryFormDataEntries, options?: { readonly arrayKeyStyle?: 'repeat' | 'brackets' }): FormData {
  throw new Error('[foundry-utils]: not implemented');
}
