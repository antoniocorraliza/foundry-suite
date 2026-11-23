import { LICENSE_ID } from '../constants/package-settings.constant.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import { findFileRequiringNotice } from './find-file-requiring-notice.function.ts';

function readTarballFile(tarball: Tarball, path: string): string {
  return tarball.contents.get(path) ?? '';
}

// The license field names MIT and the license of each third-party material in the package, as an SPDX expression.
function createLicenseExpression(tarball: Tarball, sourceFiles: ReadonlyArray<string>): string {
  const noticeLicenses: Array<string> = tarball.foundryPackage.notices
    .filter((notice) => findFileRequiringNotice(notice, tarball, sourceFiles) !== null)
    .map((notice) => notice.licenseId);
  return [LICENSE_ID, ...noticeLicenses].join(' AND ');
}

export function findLicenseProblems(tarball: Tarball, rootLicense: string, sourceFiles: ReadonlyArray<string>): Array<string> {
  const problems: Array<string> = [];
  const expectedLicense: string = createLicenseExpression(tarball, sourceFiles);
  if (tarball.manifest.license !== expectedLicense) {
    problems.push(`"license" is "${tarball.manifest.license ?? ''}", not "${expectedLicense}"`);
  }
  if (!tarball.files.includes('LICENSE')) {
    problems.push('LICENSE is not in the tarball');
  } else if (readTarballFile(tarball, 'LICENSE') !== rootLicense) {
    problems.push('LICENSE in the tarball differs from the root LICENSE (copy it again)');
  }
  return problems;
}
