export function readCldrVersion(): string {
  return (process.versions['cldr'] ?? '').split('.')[0] ?? '';
}
