import type { Tarball } from '../interfaces/tarball.interface.ts';
import { findFileRequiringNotice } from './find-file-requiring-notice.function.ts';

export function findNoticeProblems(tarball: Tarball, sourceFiles: ReadonlyArray<string>): Array<string> {
  const problems: Array<string> = [];
  tarball.foundryPackage.notices.forEach((notice) => {
    const trigger: string | null = findFileRequiringNotice(notice, tarball, sourceFiles);
    if (trigger !== null && !tarball.files.includes(notice.noticePath)) {
      problems.push(`${notice.noticePath} is missing (${notice.description}); required because of ${trigger}`);
    }
  });
  return problems;
}
