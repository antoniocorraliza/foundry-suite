import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { FOUNDRY_PACKAGES } from './constants/foundry-packages.constant.ts';
import { PACKAGES_DIST_DIRECTORY } from './constants/packages-dist-directory.constant.ts';
import { PACKAGES_SOURCE_DIRECTORY } from './constants/packages-source-directory.constant.ts';
import { checkAny } from './functions/check-any.function.ts';
import { checkDependencies } from './functions/check-dependencies.function.ts';
import { checkExports } from './functions/check-exports.function.ts';
import { checkLicense } from './functions/check-license.function.ts';
import { checkManifest } from './functions/check-manifest.function.ts';
import { checkNotices } from './functions/check-notices.function.ts';
import { checkPeers } from './functions/check-peers.function.ts';
import { checkTslib } from './functions/check-tslib.function.ts';
import type { FoundryPackage } from './interfaces/foundry-package.interface.ts';
import type { NpmPackEntry } from './interfaces/npm-pack-entry.interface.ts';
import type { PackageManifest } from './interfaces/package-manifest.interface.ts';
import type { Tarball } from './interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from './types/foundry-package-folder.type.ts';

function listFiles(directory: string): Array<string> {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort();
}

function pack(foundryPackage: FoundryPackage, workDirectory: string): Tarball {
  const distDirectory: string = join(PACKAGES_DIST_DIRECTORY, foundryPackage.folder);
  if (!existsSync(join(distDirectory, 'package.json'))) {
    throw new Error(`[check-packages]: ${distDirectory}/package.json does not exist, run \`npm run build\` first`);
  }
  const packOutput: string = execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', workDirectory], {
    cwd: distDirectory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const packed: NpmPackEntry | undefined = (JSON.parse(packOutput) as ReadonlyArray<NpmPackEntry>)[0];
  if (!packed) throw new Error(`[check-packages]: npm pack returned nothing for ${foundryPackage.name}`);
  const unpackedDirectory: string = join(workDirectory, foundryPackage.folder);
  mkdirSync(unpackedDirectory, { recursive: true });
  execFileSync('tar', ['-xzf', join(workDirectory, packed.filename), '-C', unpackedDirectory, '--strip-components=1']);
  const manifest: PackageManifest = JSON.parse(readFileSync(join(unpackedDirectory, 'package.json'), 'utf8')) as PackageManifest;
  const files: Array<string> = listFiles(unpackedDirectory);
  const contents: Map<string, string> = new Map(files.map((file) => [file, readFileSync(join(unpackedDirectory, file), 'utf8')]));
  return { foundryPackage, files, contents, manifest };
}

function main(): number {
  const license: string = readFileSync('LICENSE', 'utf8');
  const workDirectory: string = mkdtempSync(join(tmpdir(), 'foundry-check-packages-'));
  let failures: number = 0;
  try {
    const tarballs: Array<Tarball> = FOUNDRY_PACKAGES.map((foundryPackage) => pack(foundryPackage, workDirectory));
    const versions: Map<FoundryPackageFolder, string> = new Map(
      tarballs.map((tarball) => [tarball.foundryPackage.folder, tarball.manifest.version ?? '']),
    );
    tarballs.forEach((tarball) => {
      console.log(`\n${tarball.foundryPackage.name}@${tarball.manifest.version ?? '?'} (${tarball.files.length} files)`);
      const sourceFiles: Array<string> = listFiles(join(PACKAGES_SOURCE_DIRECTORY, tarball.foundryPackage.folder));
      const results: Readonly<Record<string, Array<string>>> = {
        exports: checkExports(tarball, sourceFiles),
        license: checkLicense(tarball, license),
        tslib: checkTslib(tarball),
        any: checkAny(tarball),
        dependencies: checkDependencies(tarball),
        peers: checkPeers(tarball, versions),
        manifest: checkManifest(tarball),
        notices: checkNotices(tarball, sourceFiles),
      };
      Object.entries(results).forEach(([rule, problems]) => {
        console.log(`  ${problems.length === 0 ? 'ok  ' : 'FAIL'} ${rule}`);
        problems.forEach((problem) => console.log(`      ${problem}`));
        failures += problems.length;
      });
    });
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
  console.log(failures === 0 ? '\n[check-packages]: ok' : `\n[check-packages]: ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
