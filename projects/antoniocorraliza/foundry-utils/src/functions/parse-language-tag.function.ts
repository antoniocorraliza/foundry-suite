/**
 * Returns a language tag after checking that the engine accepts it.
 * @throws {TypeError} When the language tag is not a string.
 * @throws {RangeError} When the language tag is not valid, with the error of the engine as the cause.
 */
export function ɵparseLanguageTag(locale: unknown): string {
  if (typeof locale !== 'string') throw new TypeError(`[foundry-utils]: the language tag must be a string, got ${typeof locale}`);
  try {
    Intl.getCanonicalLocales(locale);
  } catch (error: unknown) {
    throw new RangeError(`[foundry-utils]: ${JSON.stringify(locale)} is not a valid language tag`, { cause: error });
  }
  return locale;
}
