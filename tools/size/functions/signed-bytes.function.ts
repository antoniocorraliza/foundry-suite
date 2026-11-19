export function signedBytes(bytes: number): string {
  return `${bytes > 0 ? '+' : ''}${bytes} B`;
}
