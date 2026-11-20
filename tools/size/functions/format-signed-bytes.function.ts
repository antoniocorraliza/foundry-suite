export function formatSignedBytes(bytes: number): string {
  return `${bytes > 0 ? '+' : ''}${bytes} B`;
}
