import type { PackageManifest } from '../../packages/interfaces/package-manifest.interface.ts';
import type { EntryFile } from '../interfaces/entry-file.interface.ts';

export function getEntryFiles(manifest: PackageManifest): Array<EntryFile> {
  const entries: Array<EntryFile> = [];
  Object.entries(manifest.exports ?? {}).forEach(([key, value]) => {
    if (!key.startsWith('.') || key.includes('*') || key === './package.json') return;
    if (typeof value !== 'object' || value === null) return;
    const file: unknown = (value as Readonly<Record<string, unknown>>)['default'];
    if (typeof file !== 'string' || !file.endsWith('.mjs')) return;
    entries.push({ entry: key === '.' ? '' : key.slice(2), file: file.replace(/^\.\//, '') });
  });
  return entries.sort((first, second) => first.entry.localeCompare(second.entry));
}
