import { NODE_ENGINE, REPOSITORY_URL } from '../constants/manifest.constant.ts';
import { PACKAGES_SOURCE_DIRECTORY } from '../constants/paths.constant.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';

export function checkManifest(tarball: Tarball): Array<string> {
  const { manifest, foundryPackage } = tarball;
  const problems: Array<string> = [];
  if (manifest.name !== foundryPackage.name) problems.push(`"name" is "${manifest.name ?? ''}"`);
  if (manifest.type !== 'module') problems.push('"type" must be "module"');
  if (manifest.engines?.['node'] !== NODE_ENGINE) problems.push(`"engines.node" must be "${NODE_ENGINE}"`);
  if (JSON.stringify(manifest.sideEffects) !== JSON.stringify(foundryPackage.sideEffects)) {
    problems.push(`"sideEffects" is ${JSON.stringify(manifest.sideEffects)}, expected ${JSON.stringify(foundryPackage.sideEffects)}`);
  }
  if (manifest.repository?.url !== REPOSITORY_URL) problems.push(`"repository.url" must be "${REPOSITORY_URL}"`);
  const directory: string = `${PACKAGES_SOURCE_DIRECTORY}/${foundryPackage.folder}`;
  if (manifest.repository?.directory !== directory) problems.push(`"repository.directory" must be "${directory}"`);
  return problems;
}
