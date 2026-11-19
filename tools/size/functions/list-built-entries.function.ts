import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuildResult } from 'esbuild';
import { build } from 'esbuild';
import type { FoundryPackage } from '../../packages/interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../../packages/interfaces/package-manifest.interface.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import { entryFiles } from './entry-files.function.ts';
import { entrySpecifier } from './entry-specifier.function.ts';

async function exportedNames(file: string): Promise<Array<string>> {
  const result: BuildResult = await build({
    entryPoints: [file],
    bundle: false,
    format: 'esm',
    metafile: true,
    write: false,
    logLevel: 'silent',
  });
  return Object.values(result.metafile?.outputs ?? {}).flatMap((output) => output.exports);
}

export async function listBuiltEntries(distDirectory: string, foundryPackages: ReadonlyArray<FoundryPackage>): Promise<Array<BuiltEntry>> {
  const builtEntries: Array<BuiltEntry> = [];
  for (const foundryPackage of foundryPackages) {
    const packageDirectory: string = join(distDirectory, foundryPackage.folder);
    const manifestPath: string = join(packageDirectory, 'package.json');
    if (!existsSync(manifestPath)) throw new Error(`[size]: ${manifestPath} does not exist, run \`npm run build\` first`);
    const manifest: PackageManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageManifest;
    for (const entryFile of entryFiles(manifest)) {
      const file: string = join(packageDirectory, entryFile.file);
      builtEntries.push({
        packageFolder: foundryPackage.folder,
        entry: entryFile.entry,
        specifier: entrySpecifier(foundryPackage.name, entryFile.entry),
        file,
        exports: (await exportedNames(file)).sort(),
      });
    }
  }
  return builtEntries;
}
