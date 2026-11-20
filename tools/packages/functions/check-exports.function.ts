import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';

function listSourceEntrySubpaths(sourceFiles: ReadonlyArray<string>): Array<string> {
  return sourceFiles
    .filter((path) => path === 'ng-package.json' || path.endsWith('/ng-package.json'))
    .map((path) => (path === 'ng-package.json' ? '.' : `./${path.slice(0, -'/ng-package.json'.length)}`))
    .sort();
}

function stripDotSlash(path: string): string {
  return path.startsWith('./') ? path.slice(2) : path;
}

function hasCssSideEffects(foundryPackage: FoundryPackage): boolean {
  return foundryPackage.sideEffects !== false && foundryPackage.sideEffects.some((pattern) => pattern.endsWith('.css'));
}

export function checkExports(tarball: Tarball, sourceFiles: ReadonlyArray<string>): Array<string> {
  const problems: Array<string> = [];
  const { manifest, files, foundryPackage } = tarball;
  const exportsMap: Readonly<Record<string, unknown>> | undefined = manifest.exports;
  if (!exportsMap || typeof exportsMap !== 'object') return ['package.json has no "exports" map'];

  const entrySubpaths: Array<string> = listSourceEntrySubpaths(sourceFiles);
  const allowed: Set<string> = new Set(['./package.json', ...entrySubpaths, ...foundryPackage.nonEntryExports]);
  ['./package.json', ...entrySubpaths].forEach((subpath) => {
    if (!(subpath in exportsMap)) problems.push(`entry "${subpath}" is missing from "exports"`);
  });
  Object.keys(exportsMap).forEach((subpath) => {
    if (!allowed.has(subpath)) problems.push(`unexpected export "${subpath}" (no entry point and not in nonEntryExports)`);
  });

  Object.entries(exportsMap).forEach(([subpath, target]) => {
    if (subpath.includes('*')) {
      if (typeof target !== 'string' || !target.includes('*')) {
        problems.push(`pattern export "${subpath}" must map to a pattern string`);
        return;
      }
      const [prefix = '', suffix = ''] = stripDotSlash(target).split('*');
      const matches: Array<string> = files.filter((file) => file.startsWith(prefix) && file.endsWith(suffix));
      console.log(`    - exports: ${subpath} matches ${matches.length} file(s) in the tarball`);
      const sourceFolder: string = prefix.slice(0, prefix.lastIndexOf('/') + 1);
      const hasSourceFolder: boolean = sourceFiles.some((file) => file.startsWith(sourceFolder));
      if (matches.length === 0 && hasCssSideEffects(foundryPackage) && hasSourceFolder) {
        problems.push(`pattern export "${subpath}" matches no file in the tarball, but the source has ${sourceFolder}`);
      }
      return;
    }
    if (subpath === './package.json') return;
    if (!target || typeof target !== 'object') {
      problems.push(`export "${subpath}" must be an object with "types" and "default"`);
      return;
    }
    const conditions: Readonly<Record<string, unknown>> = target as Readonly<Record<string, unknown>>;
    const conditionNames: Array<string> = Object.keys(conditions);
    if (conditionNames[0] !== 'types') problems.push(`export "${subpath}": "types" must be the first condition`);
    if (conditionNames.at(-1) !== 'default') problems.push(`export "${subpath}": "default" must be the last condition`);
    Object.entries(conditions).forEach(([condition, path]) => {
      if (typeof path !== 'string') {
        problems.push(`export "${subpath}" -> "${condition}" is not a path`);
      } else if (!files.includes(stripDotSlash(path))) {
        problems.push(`export "${subpath}" -> "${condition}": ${path} is not in the tarball`);
      } else if (condition === 'types' && !path.endsWith('.d.ts')) {
        problems.push(`export "${subpath}" -> "types" is not a .d.ts file`);
      }
    });
  });

  (['module', 'typings'] as const).forEach((field) => {
    const path: string | undefined = manifest[field];
    if (!path || !files.includes(stripDotSlash(path))) problems.push(`"${field}" (${path ?? 'missing'}) is not in the tarball`);
  });
  return problems;
}
