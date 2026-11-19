import type { PackageManifest } from '../../packages/interfaces/package-manifest.interface.ts';
import type { EntryFile } from '../interfaces/entry-file.interface.ts';

export function entryFiles(manifest: PackageManifest): Array<EntryFile> {
  const entries: Array<EntryFile> = [];
  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    if (!key.startsWith('.') || key.includes('*') || key === './package.json') continue;
    if (typeof value !== 'object' || value === null) continue;
    const file: unknown = (value as Readonly<Record<string, unknown>>)['default'];
    if (typeof file !== 'string' || !file.endsWith('.mjs')) continue;
    entries.push({ entry: key === '.' ? '' : key.slice(2), file: file.replace(/^\.\//, '') });
  }
  return entries.sort((first, second) => first.entry.localeCompare(second.entry));
}
