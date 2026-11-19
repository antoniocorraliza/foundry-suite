import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FOUNDRY_PACKAGES } from './constants/foundry-packages.constant.ts';
import { PACKAGES_DIST_DIRECTORY, PACKAGES_SOURCE_DIRECTORY } from './constants/paths.constant.ts';
import type { FoundryPackage } from './interfaces/foundry-package.interface.ts';
import type { ManifestDependencies } from './interfaces/manifest-dependencies.interface.ts';

function readManifest(path: string): ManifestDependencies {
  return JSON.parse(readFileSync(path, 'utf8')) as ManifestDependencies;
}

function main(): number {
  const folder: string | undefined = process.argv[2];
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (!foundryPackage) {
    console.error(`[strip-tslib]: unknown package folder "${folder ?? ''}"`);
    return 1;
  }

  // If the source manifest ever declares tslib on purpose, removing it from the build would be wrong.
  const sourceManifest: ManifestDependencies = readManifest(join(PACKAGES_SOURCE_DIRECTORY, foundryPackage.folder, 'package.json'));
  if (sourceManifest.dependencies?.['tslib'] !== undefined) {
    console.error(`[strip-tslib]: ${foundryPackage.name} declares tslib itself, nothing to strip`);
    return 1;
  }

  // ng-packagr 21 adds tslib to dependencies whenever the source manifest does not declare it, even if no file
  // imports it. The code is compiled with importHelpers: false, and check-packages proves that nothing imports tslib.
  const distManifestPath: string = join(PACKAGES_DIST_DIRECTORY, foundryPackage.folder, 'package.json');
  const distManifest: ManifestDependencies = readManifest(distManifestPath);
  if (distManifest.dependencies?.['tslib'] !== undefined) {
    delete distManifest.dependencies['tslib'];
    writeFileSync(distManifestPath, `${JSON.stringify(distManifest, null, 2)}\n`);
    console.log(`[strip-tslib]: removed the tslib dependency that ng-packagr added to ${foundryPackage.name}`);
  }
  return 0;
}

process.exitCode = main();
