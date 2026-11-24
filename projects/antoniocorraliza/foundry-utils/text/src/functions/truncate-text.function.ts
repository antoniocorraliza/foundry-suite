/**
 * Cuts a text to at most `maximumLength` visible characters, suffix included, without splitting a character.
 * @throws {RangeError} When `maximumLength` is not an integer of at least 0.
 * @throws {TypeError} When the text is not a string, or the options are not valid.
 */
export function truncateText(text: string, maximumLength: number, options?: { readonly suffix?: string }): string {
  throw new Error('[foundry-utils]: not implemented yet');
}
