import type { Tarball } from '../interfaces/tarball.interface.ts';

export function findDependencyProblems(tarball: Tarball): Array<string> {
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
