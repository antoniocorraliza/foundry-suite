import type { FoundryFormDataValue } from './foundry-form-data-value.type';

/** Fields of a form: a value, a list of values that repeat the key, or `null` and `undefined`, which are left out. */
export type FoundryFormDataEntries = Readonly<
  Record<string, FoundryFormDataValue | ReadonlyArray<FoundryFormDataValue> | null | undefined>
>;
