import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PeerDependencyMeta } from '../interfaces/peer-dependency-meta.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';

export function checkPeers(tarball: Tarball, versions: ReadonlyMap<FoundryPackageFolder, string>): Array<string> {
  const { manifest, foundryPackage } = tarball;
  const problems: Array<string> = [];
  const expected: Record<string, string> = { ...foundryPackage.peerDependencies };
  for (const folder of foundryPackage.foundryPeers) {
    const peer: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
    const version: string | undefined = versions.get(folder);
    if (peer && version) expected[peer.name] = `^${version}`;
  }
  const actual: Readonly<Record<string, string>> = manifest.peerDependencies ?? {};
  for (const [name, range] of Object.entries(expected)) {
    if (actual[name] === undefined) problems.push(`peer ${name} is missing (expected "${range}")`);
    else if (actual[name] !== range) problems.push(`peer ${name} is "${actual[name]}", expected "${range}"`);
  }
  for (const name of Object.keys(actual)) {
    if (expected[name] === undefined) problems.push(`unexpected peer ${name}`);
  }
  const peersMeta: Readonly<Record<string, PeerDependencyMeta>> = manifest.peerDependenciesMeta ?? {};
  const optionalPeers: Array<string> = Object.keys(peersMeta)
    .filter((name) => peersMeta[name]?.optional === true)
    .sort();
  const expectedOptionalPeers: Array<string> = [...foundryPackage.optionalPeers].sort();
  if (optionalPeers.join() !== expectedOptionalPeers.join()) {
    problems.push(`optional peers are [${optionalPeers.join(', ')}], expected [${expectedOptionalPeers.join(', ')}]`);
  }
  return problems;
}
