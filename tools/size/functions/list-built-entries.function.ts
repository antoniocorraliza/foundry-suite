import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuildResult } from 'esbuild';
import { build } from 'esbuild';
import type { FoundryPackage } from '../../packages/interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../../packages/interfaces/package-manifest.interface.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import { getEntryFiles } from './get-entry-files.function.ts';
import { getEntrySpecifier } from './get-entry-specifier.function.ts';

async function readExportedNames(file: string): Promise<Array<string>> {
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
    for (const entryFile of getEntryFiles(manifest)) {
      const file: string = join(packageDirectory, entryFile.file);
      builtEntries.push({
        packageFolder: foundryPackage.folder,
        entry: entryFile.entry,
        specifier: getEntrySpecifier(foundryPackage.name, entryFile.entry),
        file,
        exports: (await readExportedNames(file)).sort(),
      });
    }
  }
  return builtEntries;
}
