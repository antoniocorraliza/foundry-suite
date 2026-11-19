export function entrySpecifier(packageName: string, entry: string): string {
  return entry === '' ? packageName : `${packageName}/${entry}`;
}
