import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { ThirdPartyNotice } from '../interfaces/third-party-notice.interface.ts';

function findFileRequiringNotice(notice: ThirdPartyNotice, tarball: Tarball, sourceFiles: ReadonlyArray<string>): string | null {
  const { whenTarballHas, whenSourceHas } = notice;
  const inTarball: string | null = whenTarballHas ? (tarball.files.find((file) => whenTarballHas.test(file)) ?? null) : null;
  if (inTarball) return inTarball;
  return whenSourceHas ? (sourceFiles.find((file) => whenSourceHas.test(file)) ?? null) : null;
}

export function checkNotices(tarball: Tarball, sourceFiles: ReadonlyArray<string>): Array<string> {
  const problems: Array<string> = [];
  tarball.foundryPackage.notices.forEach((notice) => {
    const trigger: string | null = findFileRequiringNotice(notice, tarball, sourceFiles);
    if (!trigger) {
      console.log(`    - notices: ${notice.noticePath} not required yet (nothing it covers is present)`);
    } else if (!tarball.files.includes(notice.noticePath)) {
      problems.push(`${notice.noticePath} is missing (${notice.description}); required because of ${trigger}`);
    }
  });
  return problems;
}
