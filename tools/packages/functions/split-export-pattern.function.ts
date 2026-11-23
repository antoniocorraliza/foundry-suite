export function splitExportPattern(target: string): readonly [prefix: string, suffix: string] {
  const [prefix = '', suffix = ''] = target.replace(/^\.\//, '').split('*');
  return [prefix, suffix];
}
