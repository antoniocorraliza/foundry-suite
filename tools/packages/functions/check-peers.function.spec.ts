import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { checkPeers } from './check-peers.function.ts';

function createTarball(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

const ANGULAR: string = '>=21.0.0 <23.0.0';
const VERSIONS: ReadonlyMap<FoundryPackageFolder, string> = new Map<FoundryPackageFolder, string>([['foundry-utils', '2.0.0-rc.3']]);
const UI_PEERS: Readonly<Record<string, string>> = {
  '@angular/common': ANGULAR,
  '@angular/core': ANGULAR,
  '@angular/forms': ANGULAR,
  '@angular/router': ANGULAR,
  rxjs: '^7.8.0',
  '@antoniocorraliza/foundry-utils': '^2.0.0-rc.3',
};

describe('checkPeers', () => {
  it('accepts the expected peers, with Foundry peers on the version built with them', () => {
    const manifest: PackageManifest = { peerDependencies: UI_PEERS, peerDependenciesMeta: { '@angular/router': { optional: true } } };
    expect(checkPeers(createTarball('foundry-ui', manifest), VERSIONS)).toEqual([]);
  });

  it('reports a missing, a different and an unexpected peer', () => {
    const peerDependencies: Readonly<Record<string, string>> = {
      ...Object.fromEntries(Object.entries(UI_PEERS).filter(([name]) => name !== 'rxjs')),
      '@antoniocorraliza/foundry-utils': '^2.0.0-rc.2',
      lodash: '*',
    };
    const manifest: PackageManifest = { peerDependencies, peerDependenciesMeta: { '@angular/router': { optional: true } } };
    expect(checkPeers(createTarball('foundry-ui', manifest), VERSIONS)).toEqual([
      'peer rxjs is missing (expected "^7.8.0")',
      'peer @antoniocorraliza/foundry-utils is "^2.0.0-rc.2", expected "^2.0.0-rc.3"',
      'unexpected peer lodash',
    ]);
  });

  it('reports optional peers that differ from the expected ones', () => {
    expect(checkPeers(createTarball('foundry-ui', { peerDependencies: UI_PEERS }), VERSIONS)).toEqual([
      'optional peers are [], expected [@angular/router]',
    ]);
  });
});
