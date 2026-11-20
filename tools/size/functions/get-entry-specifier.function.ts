export function getEntrySpecifier(packageName: string, entry: string): string {
  return entry === '' ? packageName : `${packageName}/${entry}`;
}
