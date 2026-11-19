import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import { FOUNDRY_PACKAGES } from './constants/foundry-packages.constant.ts';
import { LICENSE_ID, NODE_ENGINE, REPOSITORY_URL } from './constants/manifest.constant.ts';
import { PACKAGES_DIST_DIRECTORY, PACKAGES_SOURCE_DIRECTORY } from './constants/paths.constant.ts';
import { TSLIB_IMPORT } from './constants/tslib-import.constant.ts';
import type { FoundryPackage } from './interfaces/foundry-package.interface.ts';
import type { FoundryPackageFolder } from './interfaces/foundry-package-folder.type.ts';
import type { NpmPackEntry } from './interfaces/npm-pack-entry.interface.ts';
import type { PackageManifest } from './interfaces/package-manifest.interface.ts';
import type { PeerDependencyMeta } from './interfaces/peer-dependency-meta.interface.ts';
import type { Tarball } from './interfaces/tarball.interface.ts';
import type { ThirdPartyNotice } from './interfaces/third-party-notice.interface.ts';

function rootLicense(): string {
  return readFileSync('LICENSE', 'utf8');
}

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
  return { foundryPackage, unpackedDirectory, files: listFiles(unpackedDirectory), manifest };
}

function readTarballFile(tarball: Tarball, path: string): string {
  return readFileSync(join(tarball.unpackedDirectory, path), 'utf8');
}

function sourceEntrySubpaths(folder: FoundryPackageFolder): Array<string> {
  const packageDirectory: string = join(PACKAGES_SOURCE_DIRECTORY, folder);
  return listFiles(packageDirectory)
    .filter((path) => path === 'ng-package.json' || path.endsWith('/ng-package.json'))
    .map((path) => (path === 'ng-package.json' ? '.' : `./${path.slice(0, -'/ng-package.json'.length)}`))
    .sort();
}

function stripDotSlash(path: string): string {
  return path.startsWith('./') ? path.slice(2) : path;
}

function checkExports(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  const { manifest, files, foundryPackage } = tarball;
  const exportsMap: Readonly<Record<string, unknown>> | undefined = manifest.exports;
  if (!exportsMap || typeof exportsMap !== 'object') return ['package.json has no "exports" map'];

  const entrySubpaths: Array<string> = sourceEntrySubpaths(foundryPackage.folder);
  const allowed: Set<string> = new Set(['./package.json', ...entrySubpaths, ...foundryPackage.nonEntryExports]);
  for (const subpath of ['./package.json', ...entrySubpaths]) {
    if (!(subpath in exportsMap)) problems.push(`entry "${subpath}" is missing from "exports"`);
  }
  for (const subpath of Object.keys(exportsMap)) {
    if (!allowed.has(subpath)) problems.push(`unexpected export "${subpath}" (no entry point and not in nonEntryExports)`);
  }

  for (const [subpath, target] of Object.entries(exportsMap)) {
    if (subpath.includes('*')) {
      if (typeof target !== 'string' || !target.includes('*')) {
        problems.push(`pattern export "${subpath}" must map to a pattern string`);
        continue;
      }
      const [prefix = '', suffix = ''] = stripDotSlash(target).split('*');
      const matches: Array<string> = files.filter((file) => file.startsWith(prefix) && file.endsWith(suffix));
      console.log(`    - exports: ${subpath} matches ${matches.length} file(s) in the tarball`);
      continue;
    }
    if (subpath === './package.json') continue;
    if (!target || typeof target !== 'object') {
      problems.push(`export "${subpath}" must be an object with "types" and "default"`);
      continue;
    }
    const conditions: Readonly<Record<string, unknown>> = target as Readonly<Record<string, unknown>>;
    const conditionNames: Array<string> = Object.keys(conditions);
    if (conditionNames[0] !== 'types') problems.push(`export "${subpath}": "types" must be the first condition`);
    if (conditionNames.at(-1) !== 'default') problems.push(`export "${subpath}": "default" must be the last condition`);
    for (const [condition, path] of Object.entries(conditions)) {
      if (typeof path !== 'string') {
        problems.push(`export "${subpath}" -> "${condition}" is not a path`);
      } else if (!files.includes(stripDotSlash(path))) {
        problems.push(`export "${subpath}" -> "${condition}": ${path} is not in the tarball`);
      } else if (condition === 'types' && !path.endsWith('.d.ts')) {
        problems.push(`export "${subpath}" -> "types" is not a .d.ts file`);
      }
    }
  }

  for (const field of ['module', 'typings'] as const) {
    const path: string | undefined = manifest[field];
    if (!path || !files.includes(stripDotSlash(path))) problems.push(`"${field}" (${path ?? 'missing'}) is not in the tarball`);
  }
  return problems;
}

function checkLicense(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  if (tarball.manifest.license !== LICENSE_ID) problems.push(`"license" is "${tarball.manifest.license ?? ''}", not "${LICENSE_ID}"`);
  if (!tarball.files.includes('LICENSE')) {
    problems.push('LICENSE is not in the tarball');
  } else if (readTarballFile(tarball, 'LICENSE') !== rootLicense()) {
    problems.push('LICENSE in the tarball differs from the root LICENSE (copy it again)');
  }
  return problems;
}

function checkTslib(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  for (const file of tarball.files.filter((path) => /\.(?:mjs|js|cjs|d\.ts)$/.test(path))) {
    const lines: Array<string> = readTarballFile(tarball, file).split('\n');
    lines.forEach((line, index) => {
      if (TSLIB_IMPORT.test(line)) problems.push(`${file}:${index + 1} imports tslib`);
    });
  }
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies'] as const) {
    if (tarball.manifest[field]?.['tslib'] !== undefined) problems.push(`"${field}" declares tslib`);
  }
  return problems;
}

// Uses the TypeScript parser: a regular expression would also match `any` inside comments and names.
function checkAny(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  for (const file of tarball.files.filter((path) => path.endsWith('.d.ts'))) {
    const source: ts.SourceFile = ts.createSourceFile(file, readTarballFile(tarball, file), ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push(`${file}:${line + 1} uses \`any\`: ${node.parent.getText(source).slice(0, 80)}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return problems;
}

function checkDependencies(tarball: Tarball): Array<string> {
  const { manifest } = tarball;
  const problems: Array<string> = [];
  const dependencies: Array<string> = Object.keys(manifest.dependencies ?? {});
  if (dependencies.length > 0) problems.push(`"dependencies" must be empty; it has: ${dependencies.join(', ')}`);
  const optionalDependencies: Array<string> = Object.keys(manifest.optionalDependencies ?? {});
  if (optionalDependencies.length > 0) {
    problems.push(`"optionalDependencies" must not exist; it has: ${optionalDependencies.join(', ')}`);
  }
  if (manifest.bundleDependencies !== undefined || manifest.bundledDependencies !== undefined) {
    problems.push('"bundleDependencies" must not exist');
  }
  return problems;
}

function checkPeers(tarball: Tarball, versions: ReadonlyMap<FoundryPackageFolder, string>): Array<string> {
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

function checkManifest(tarball: Tarball): Array<string> {
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

function fileRequiringNotice(notice: ThirdPartyNotice, tarball: Tarball, sourceFiles: ReadonlyArray<string>): string | undefined {
  const { whenTarballHas, whenSourceHas } = notice;
  const inTarball: string | undefined = whenTarballHas ? tarball.files.find((file) => whenTarballHas.test(file)) : undefined;
  if (inTarball) return inTarball;
  return whenSourceHas ? sourceFiles.find((file) => whenSourceHas.test(file)) : undefined;
}

function checkNotices(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  const sourceFiles: Array<string> = listFiles(join(PACKAGES_SOURCE_DIRECTORY, tarball.foundryPackage.folder));
  for (const notice of tarball.foundryPackage.notices) {
    const trigger: string | undefined = fileRequiringNotice(notice, tarball, sourceFiles);
    if (!trigger) {
      console.log(`    - notices: ${notice.noticePath} not required yet (nothing it covers is present)`);
    } else if (!tarball.files.includes(notice.noticePath)) {
      problems.push(`${notice.noticePath} is missing (${notice.description}); required because of ${trigger}`);
    }
  }
  return problems;
}

function main(): number {
  const workDirectory: string = mkdtempSync(join(tmpdir(), 'foundry-check-packages-'));
  let failures: number = 0;
  try {
    const tarballs: Array<Tarball> = FOUNDRY_PACKAGES.map((foundryPackage) => pack(foundryPackage, workDirectory));
    const versions: Map<FoundryPackageFolder, string> = new Map(
      tarballs.map((tarball) => [tarball.foundryPackage.folder, tarball.manifest.version ?? '']),
    );
    for (const tarball of tarballs) {
      console.log(`\n${tarball.foundryPackage.name}@${tarball.manifest.version ?? '?'} (${tarball.files.length} files)`);
      const results: Readonly<Record<string, Array<string>>> = {
        exports: checkExports(tarball),
        license: checkLicense(tarball),
        tslib: checkTslib(tarball),
        any: checkAny(tarball),
        dependencies: checkDependencies(tarball),
        peers: checkPeers(tarball, versions),
        manifest: checkManifest(tarball),
        notices: checkNotices(tarball),
      };
      for (const [rule, problems] of Object.entries(results)) {
        console.log(`  ${problems.length === 0 ? 'ok  ' : 'FAIL'} ${rule}`);
        for (const problem of problems) console.log(`      ${problem}`);
        failures += problems.length;
      }
    }
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
  console.log(failures === 0 ? '\n[check-packages]: ok' : `\n[check-packages]: ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
