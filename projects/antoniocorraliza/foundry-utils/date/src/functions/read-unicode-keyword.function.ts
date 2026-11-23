/** Returns the value of a keyword of the `-u-` extension of a canonical language tag, or `null` when it has none. */
export function readUnicodeKeyword(tag: string, key: string): string | null {
  const subtags: Array<string> = tag.toLowerCase().split('-');
  const extensionStart: number = subtags.findIndex((subtag) => subtag === 'u' || subtag === 'x');
  if (subtags[extensionStart] !== 'u') return null;
  const extension: Array<string> = subtags.slice(extensionStart + 1);
  const extensionEnd: number = extension.findIndex((subtag) => subtag.length === 1);
  const keywords: Array<string> = extensionEnd === -1 ? extension : extension.slice(0, extensionEnd);
  const keyIndex: number = keywords.indexOf(key);
  const value: string = keyIndex === -1 ? '' : (keywords[keyIndex + 1] ?? '');
  return value.length < 3 ? null : value;
}
