import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { ThirdPartyNotice } from '../interfaces/third-party-notice.interface.ts';

function fileRequiringNotice(notice: ThirdPartyNotice, tarball: Tarball, sourceFiles: ReadonlyArray<string>): string | undefined {
  const { whenTarballHas, whenSourceHas } = notice;
  const inTarball: string | undefined = whenTarballHas ? tarball.files.find((file) => whenTarballHas.test(file)) : undefined;
  if (inTarball) return inTarball;
  return whenSourceHas ? sourceFiles.find((file) => whenSourceHas.test(file)) : undefined;
}

export function checkNotices(tarball: Tarball, sourceFiles: ReadonlyArray<string>): Array<string> {
  const problems: Array<string> = [];
  for (const notice of tarball.foundryPackage.notices) {
    const trigger: string | undefined = fileRequiringNotice(notice, tarball, sourceFiles);
    if (!trigger) {
      console.log(`    - notices: ${notice.noticePath} not required yet (nothing it covers is present)`);
    } else if (!tarball.files.includes(notice.noticePath)) {
      problems.push(`${notice.noticePath} is missing (${notice.description}); required because of ${trigger}`);
    }
  }
  return problems;
}
