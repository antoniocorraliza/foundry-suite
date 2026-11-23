import type { Tarball } from '../interfaces/tarball.interface.ts';
import { findFileRequiringNotice } from './find-file-requiring-notice.function.ts';

function listPatternExportNotes(tarball: Tarball): Array<string> {
  return Object.entries(tarball.manifest.exports ?? {})
    .filter(([subpath, target]) => subpath.includes('*') && typeof target === 'string' && target.includes('*'))
    .map(([subpath, target]) => {
      const [prefix = '', suffix = ''] = String(target).replace(/^\.\//, '').split('*');
      const matches: number = tarball.files.filter((file) => file.startsWith(prefix) && file.endsWith(suffix)).length;
      return `exports: ${subpath} matches ${matches} file(s) in the tarball`;
    });
}

export function listPackageNotes(tarball: Tarball, sourceFiles: ReadonlyArray<string>): Array<string> {
  const noticeNotes: Array<string> = tarball.foundryPackage.notices
    .filter((notice) => findFileRequiringNotice(notice, tarball, sourceFiles) === null)
    .map((notice) => `notices: ${notice.noticePath} not required yet (nothing it covers is present)`);
  return [...listPatternExportNotes(tarball), ...noticeNotes];
}
