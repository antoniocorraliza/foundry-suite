import { LICENSE_ID } from '../constants/license-id.constant.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';

function readTarballFile(tarball: Tarball, path: string): string {
  return tarball.contents.get(path) ?? '';
}

export function checkLicense(tarball: Tarball, rootLicense: string): Array<string> {
  const problems: Array<string> = [];
  if (tarball.manifest.license !== LICENSE_ID) problems.push(`"license" is "${tarball.manifest.license ?? ''}", not "${LICENSE_ID}"`);
  if (!tarball.files.includes('LICENSE')) {
    problems.push('LICENSE is not in the tarball');
  } else if (readTarballFile(tarball, 'LICENSE') !== rootLicense) {
    problems.push('LICENSE in the tarball differs from the root LICENSE (copy it again)');
  }
  return problems;
}
