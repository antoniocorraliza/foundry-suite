import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FOUNDRY_PACKAGES } from './constants/foundry-packages.constant.ts';
import { PACKAGES_DIST_DIRECTORY, PACKAGES_SOURCE_DIRECTORY } from './constants/package-directories.constant.ts';
import type { FoundryPackage } from './interfaces/foundry-package.interface.ts';
import type { PackageManifest } from './interfaces/package-manifest.interface.ts';

function readManifest(path: string): PackageManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest;
}

function main(): number {
  const folder: string | undefined = process.argv[2];
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (!foundryPackage) {
    console.error(`[strip-tslib]: unknown package folder "${folder ?? ''}"`);
    return 1;
  }

  const sourceManifest: PackageManifest = readManifest(join(PACKAGES_SOURCE_DIRECTORY, foundryPackage.folder, 'package.json'));
  if (sourceManifest.dependencies?.['tslib'] !== undefined) {
    console.error(`[strip-tslib]: ${foundryPackage.name} declares tslib itself, nothing to strip`);
    return 1;
  }

  // ng-packagr 21 adds tslib to dependencies whenever the source manifest does not declare it, even if no file imports it.
  const distManifestPath: string = join(PACKAGES_DIST_DIRECTORY, foundryPackage.folder, 'package.json');
  const distManifest: PackageManifest = readManifest(distManifestPath);
  const { tslib, ...dependencies } = distManifest.dependencies ?? {};
  if (tslib !== undefined) {
    writeFileSync(distManifestPath, `${JSON.stringify({ ...distManifest, dependencies }, null, 2)}\n`);
    console.log(`[strip-tslib]: removed the tslib dependency that ng-packagr added to ${foundryPackage.name}`);
  }
  return 0;
}

process.exitCode = main();
