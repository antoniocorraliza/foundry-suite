import { TSLIB_IMPORT } from '../constants/tslib-import.constant.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';

function readTarballFile(tarball: Tarball, path: string): string {
  return tarball.contents.get(path) ?? '';
}

export function checkTslib(tarball: Tarball): Array<string> {
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
