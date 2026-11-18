/*
 * Removes the `tslib` dependency that ng-packagr adds to the built package.json.
 *
 * ng-packagr 21 adds `"tslib"` to `dependencies` whenever the source manifest does not declare
 * it, even if no file imports it. The packages are published with `dependencies: {}` and compiled
 * with `importHelpers: false`, so the emitted code never imports tslib.
 * This script only fixes the manifest; check-packages.ts proves that no file imports tslib.
 *
 * Usage: node tools/packages/strip-tslib.ts <package folder>   (for example, foundry-utils)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FOUNDRY_PACKAGES, PACKAGES_DIST_DIRECTORY, PACKAGES_SOURCE_DIRECTORY } from './packages.ts';

const folder = process.argv[2];
const foundryPackage = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
if (!foundryPackage) {
  console.error(`strip-tslib: unknown package folder "${folder ?? ''}".`);
  process.exit(1);
}

interface Manifest {
  dependencies?: Record<string, string>;
}

const readManifest = (path: string): Manifest => JSON.parse(readFileSync(path, 'utf8')) as Manifest;

const sourceManifest = readManifest(join(PACKAGES_SOURCE_DIRECTORY, foundryPackage.folder, 'package.json'));
if (sourceManifest.dependencies?.['tslib'] !== undefined) {
  console.error(`strip-tslib: ${foundryPackage.name} declares tslib itself; nothing to strip.`);
  process.exit(1);
}

const distManifestPath = join(PACKAGES_DIST_DIRECTORY, foundryPackage.folder, 'package.json');
const distManifest = readManifest(distManifestPath);
if (distManifest.dependencies?.['tslib'] !== undefined) {
  delete distManifest.dependencies['tslib'];
  writeFileSync(distManifestPath, `${JSON.stringify(distManifest, null, 2)}\n`);
  console.log(`strip-tslib: removed the tslib dependency that ng-packagr added to ${foundryPackage.name}.`);
}
