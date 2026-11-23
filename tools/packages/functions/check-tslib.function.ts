import { TSLIB_IMPORT } from '../constants/package-settings.constant.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';

function readTarballFile(tarball: Tarball, path: string): string {
  return tarball.contents.get(path) ?? '';
}

export function checkTslib(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  tarball.files
    .filter((path) => /\.(?:mjs|js|cjs|d\.ts)$/.test(path))
    .forEach((file) => {
      const lines: Array<string> = readTarballFile(tarball, file).split('\n');
      lines.forEach((line, index) => {
        if (TSLIB_IMPORT.test(line)) problems.push(`${file}:${index + 1} imports tslib`);
      });
    });
  (['dependencies', 'peerDependencies', 'optionalDependencies'] as const).forEach((field) => {
    if (tarball.manifest[field]?.['tslib'] !== undefined) problems.push(`"${field}" declares tslib`);
  });
  return problems;
}
