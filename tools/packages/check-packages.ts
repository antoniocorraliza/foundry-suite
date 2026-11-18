/*
 * Checks what goes inside each package tarball (block B2). Run it after `npm run build`.
 *
 * For each package it runs `npm pack` on dist/, unpacks the tarball and checks:
 *   exports       every entry point has an export with `types` (first) and `default`, and the files exist
 *   license       LICENSE inside, identical to the root one, and "license": "MIT"
 *   tslib         no file imports tslib and no manifest field declares it
 *   any           no `any` in the published .d.ts files (read with the TypeScript parser, not a regex)
 *   dependencies  `dependencies` is empty
 *   peers         the peers of decision 26, and Foundry peers as `^<version>` (decision 27)
 *   manifest      engines, sideEffects, type and repository
 *   notices       third-party notices present when the material they cover is present
 *
 * Exit code 1 if any rule fails. The expected values live in packages.ts.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import {
  FOUNDRY_PACKAGES,
  LICENSE_ID,
  NODE_ENGINE,
  PACKAGES_DIST_DIRECTORY,
  PACKAGES_SOURCE_DIRECTORY,
  REPOSITORY_URL,
  type FoundryPackage,
  type FoundryPackageFolder,
} from './packages.ts';

type Rule = 'exports' | 'license' | 'tslib' | 'any' | 'dependencies' | 'peers' | 'manifest' | 'notices';
const RULES: readonly Rule[] = ['exports', 'license', 'tslib', 'any', 'dependencies', 'peers', 'manifest', 'notices'];

interface Manifest {
  readonly name?: string;
  readonly version?: string;
  readonly license?: string;
  readonly type?: string;
  readonly module?: string;
  readonly typings?: string;
  readonly sideEffects?: unknown;
  readonly engines?: Readonly<Record<string, string>>;
  readonly repository?: { readonly url?: string; readonly directory?: string };
  readonly exports?: Readonly<Record<string, unknown>>;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly optionalDependencies?: Readonly<Record<string, string>>;
  readonly bundleDependencies?: unknown;
  readonly bundledDependencies?: unknown;
  readonly peerDependencies?: Readonly<Record<string, string>>;
  readonly peerDependenciesMeta?: Readonly<Record<string, { readonly optional?: boolean }>>;
}

interface Tarball {
  readonly foundryPackage: FoundryPackage;
  /** Folder with the unpacked `package/` contents. */
  readonly root: string;
  /** Paths relative to `root`, with `/`. */
  readonly files: readonly string[];
  readonly manifest: Manifest;
}

const ROOT_LICENSE = readFileSync('LICENSE', 'utf8');
const TSLIB_IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]tslib(?:\/[^'"]*)?['"]/;

function listFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort();
}

function pack(foundryPackage: FoundryPackage, workDirectory: string): Tarball {
  const distDirectory = join(PACKAGES_DIST_DIRECTORY, foundryPackage.folder);
  if (!existsSync(join(distDirectory, 'package.json'))) {
    throw new Error(`${distDirectory}/package.json does not exist: run \`npm run build\` first.`);
  }
  const packOutput = execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', workDirectory], {
    cwd: distDirectory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const [packed] = JSON.parse(packOutput) as readonly { readonly filename: string }[];
  if (!packed) throw new Error(`npm pack returned nothing for ${foundryPackage.name}.`);
  const root = join(workDirectory, foundryPackage.folder);
  mkdirSync(root, { recursive: true });
  execFileSync('tar', ['-xzf', join(workDirectory, packed.filename), '-C', root, '--strip-components=1']);
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Manifest;
  return { foundryPackage, root, files: listFiles(root), manifest };
}

function readTarballFile(tarball: Tarball, path: string): string {
  return readFileSync(join(tarball.root, path), 'utf8');
}

/** './date' for `projects/antoniocorraliza/foundry-utils/date/ng-package.json`; '.' for the primary entry. */
function sourceEntrySubpaths(folder: FoundryPackageFolder): string[] {
  const packageDirectory = join(PACKAGES_SOURCE_DIRECTORY, folder);
  return listFiles(packageDirectory)
    .filter((path) => path === 'ng-package.json' || path.endsWith('/ng-package.json'))
    .map((path) => (path === 'ng-package.json' ? '.' : `./${path.slice(0, -'/ng-package.json'.length)}`))
    .sort();
}

function stripDotSlash(path: string): string {
  return path.startsWith('./') ? path.slice(2) : path;
}

function checkExports(tarball: Tarball): string[] {
  const problems: string[] = [];
  const { manifest, files, foundryPackage } = tarball;
  const exportsMap = manifest.exports;
  if (!exportsMap || typeof exportsMap !== 'object') return ['package.json has no "exports" map.'];

  const fromEntries = sourceEntrySubpaths(foundryPackage.folder);
  const allowed = new Set(['./package.json', ...fromEntries, ...foundryPackage.extraExports]);
  for (const subpath of ['./package.json', ...fromEntries]) {
    if (!(subpath in exportsMap)) problems.push(`entry "${subpath}" is missing from "exports".`);
  }
  for (const subpath of Object.keys(exportsMap)) {
    if (!allowed.has(subpath)) problems.push(`unexpected export "${subpath}" (no entry point and not in extraExports).`);
  }

  for (const [subpath, target] of Object.entries(exportsMap)) {
    if (subpath.includes('*')) {
      if (typeof target !== 'string' || !target.includes('*')) {
        problems.push(`pattern export "${subpath}" must map to a pattern string.`);
        continue;
      }
      const [prefix = '', suffix = ''] = stripDotSlash(target).split('*');
      const matches = files.filter((file) => file.startsWith(prefix) && file.endsWith(suffix));
      console.log(`    · exports: ${subpath} matches ${matches.length} file(s) in the tarball`);
      continue;
    }
    if (subpath === './package.json') continue;
    if (!target || typeof target !== 'object') {
      problems.push(`export "${subpath}" must be an object with "types" and "default".`);
      continue;
    }
    const conditions = target as Readonly<Record<string, unknown>>;
    const conditionNames = Object.keys(conditions);
    if (conditionNames[0] !== 'types') problems.push(`export "${subpath}": "types" must be the first condition.`);
    if (conditionNames.at(-1) !== 'default') problems.push(`export "${subpath}": "default" must be the last condition.`);
    for (const [condition, path] of Object.entries(conditions)) {
      if (typeof path !== 'string') {
        problems.push(`export "${subpath}" → "${condition}" is not a path.`);
      } else if (!files.includes(stripDotSlash(path))) {
        problems.push(`export "${subpath}" → "${condition}": ${path} is not in the tarball.`);
      } else if (condition === 'types' && !path.endsWith('.d.ts')) {
        problems.push(`export "${subpath}" → "types" is not a .d.ts file.`);
      }
    }
  }

  for (const field of ['module', 'typings'] as const) {
    const path = manifest[field];
    if (!path || !files.includes(stripDotSlash(path))) problems.push(`"${field}" (${path ?? 'missing'}) is not in the tarball.`);
  }
  return problems;
}

function checkLicense(tarball: Tarball): string[] {
  const problems: string[] = [];
  if (tarball.manifest.license !== LICENSE_ID) problems.push(`"license" is "${tarball.manifest.license ?? ''}", not "${LICENSE_ID}".`);
  if (!tarball.files.includes('LICENSE')) {
    problems.push('LICENSE is not in the tarball.');
  } else if (readTarballFile(tarball, 'LICENSE') !== ROOT_LICENSE) {
    problems.push('LICENSE in the tarball differs from the root LICENSE (copy it again).');
  }
  return problems;
}

function checkTslib(tarball: Tarball): string[] {
  const problems: string[] = [];
  for (const file of tarball.files.filter((path) => /\.(?:mjs|js|cjs|d\.ts)$/.test(path))) {
    const lines = readTarballFile(tarball, file).split('\n');
    lines.forEach((line, index) => {
      if (TSLIB_IMPORT.test(line)) problems.push(`${file}:${index + 1} imports tslib.`);
    });
  }
  const { manifest } = tarball;
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies'] as const) {
    if (manifest[field]?.['tslib'] !== undefined) problems.push(`"${field}" declares tslib.`);
  }
  return problems;
}

function checkAny(tarball: Tarball): string[] {
  const problems: string[] = [];
  for (const file of tarball.files.filter((path) => path.endsWith('.d.ts'))) {
    const source = ts.createSourceFile(file, readTarballFile(tarball, file), ts.ScriptTarget.Latest, true);
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

function checkDependencies(tarball: Tarball): string[] {
  const { manifest } = tarball;
  const problems: string[] = [];
  const dependencies = Object.keys(manifest.dependencies ?? {});
  if (dependencies.length > 0) problems.push(`"dependencies" must be empty; it has: ${dependencies.join(', ')}.`);
  const optional = Object.keys(manifest.optionalDependencies ?? {});
  if (optional.length > 0) problems.push(`"optionalDependencies" must not exist; it has: ${optional.join(', ')}.`);
  if (manifest.bundleDependencies !== undefined || manifest.bundledDependencies !== undefined) {
    problems.push('"bundleDependencies" must not exist.');
  }
  return problems;
}

function checkPeers(tarball: Tarball, versions: ReadonlyMap<FoundryPackageFolder, string>): string[] {
  const { manifest, foundryPackage } = tarball;
  const problems: string[] = [];
  const expected: Record<string, string> = { ...foundryPackage.peerDependencies };
  for (const folder of foundryPackage.foundryPeers) {
    const peer = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
    const version = versions.get(folder);
    if (peer && version) expected[peer.name] = `^${version}`;
  }
  const actual = manifest.peerDependencies ?? {};
  for (const [name, range] of Object.entries(expected)) {
    if (actual[name] === undefined) problems.push(`peer ${name} is missing (expected "${range}").`);
    else if (actual[name] !== range) problems.push(`peer ${name} is "${actual[name]}", expected "${range}".`);
  }
  for (const name of Object.keys(actual)) {
    if (expected[name] === undefined) problems.push(`unexpected peer ${name}.`);
  }
  const meta = manifest.peerDependenciesMeta ?? {};
  const optional = Object.keys(meta).filter((name) => meta[name]?.optional === true).sort();
  const expectedOptional = [...foundryPackage.optionalPeers].sort();
  if (optional.join() !== expectedOptional.join()) {
    problems.push(`optional peers are [${optional.join(', ')}], expected [${expectedOptional.join(', ')}].`);
  }
  return problems;
}

function checkManifest(tarball: Tarball): string[] {
  const { manifest, foundryPackage } = tarball;
  const problems: string[] = [];
  if (manifest.name !== foundryPackage.name) problems.push(`"name" is "${manifest.name ?? ''}".`);
  if (manifest.type !== 'module') problems.push('"type" must be "module".');
  if (manifest.engines?.['node'] !== NODE_ENGINE) problems.push(`"engines.node" must be "${NODE_ENGINE}".`);
  if (JSON.stringify(manifest.sideEffects) !== JSON.stringify(foundryPackage.sideEffects)) {
    problems.push(`"sideEffects" is ${JSON.stringify(manifest.sideEffects)}, expected ${JSON.stringify(foundryPackage.sideEffects)}.`);
  }
  if (manifest.repository?.url !== REPOSITORY_URL) problems.push(`"repository.url" must be "${REPOSITORY_URL}".`);
  const directory = `${PACKAGES_SOURCE_DIRECTORY}/${foundryPackage.folder}`;
  if (manifest.repository?.directory !== directory) problems.push(`"repository.directory" must be "${directory}".`);
  return problems;
}

function checkNotices(tarball: Tarball): string[] {
  const problems: string[] = [];
  const sourceFiles = listFiles(join(PACKAGES_SOURCE_DIRECTORY, tarball.foundryPackage.folder));
  for (const notice of tarball.foundryPackage.notices) {
    const trigger =
      (notice.whenTarballHas && tarball.files.find((file) => notice.whenTarballHas?.test(file))) ??
      (notice.whenSourceHas && sourceFiles.find((file) => notice.whenSourceHas?.test(file)));
    if (trigger && !tarball.files.includes(notice.notice)) {
      problems.push(`${notice.notice} is missing (${notice.description}); required because of ${trigger}.`);
    }
    if (!trigger) console.log(`    · notices: ${notice.notice} not required yet (nothing it covers is present)`);
  }
  return problems;
}

function main(): number {
  const workDirectory = mkdtempSync(join(tmpdir(), 'foundry-check-packages-'));
  let failures = 0;
  try {
    const tarballs = FOUNDRY_PACKAGES.map((foundryPackage) => pack(foundryPackage, workDirectory));
    const versions = new Map(tarballs.map((tarball) => [tarball.foundryPackage.folder, tarball.manifest.version ?? '']));
    for (const tarball of tarballs) {
      console.log(`\n${tarball.foundryPackage.name}@${tarball.manifest.version ?? '?'} (${tarball.files.length} files)`);
      const results: Readonly<Record<Rule, string[]>> = {
        exports: checkExports(tarball),
        license: checkLicense(tarball),
        tslib: checkTslib(tarball),
        any: checkAny(tarball),
        dependencies: checkDependencies(tarball),
        peers: checkPeers(tarball, versions),
        manifest: checkManifest(tarball),
        notices: checkNotices(tarball),
      };
      for (const rule of RULES) {
        const problems = results[rule];
        console.log(`  ${problems.length === 0 ? '✓' : '✗'} ${rule}`);
        for (const problem of problems) console.log(`      ${problem}`);
        failures += problems.length;
      }
    }
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
  console.log(failures === 0 ? '\ncheck:packages: OK' : `\ncheck:packages: ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
