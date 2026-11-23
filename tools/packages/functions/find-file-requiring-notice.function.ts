import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { ThirdPartyNotice } from '../interfaces/third-party-notice.interface.ts';

export function findFileRequiringNotice(notice: ThirdPartyNotice, tarball: Tarball, sourceFiles: ReadonlyArray<string>): string | null {
  const { whenTarballHas, whenSourceHas } = notice;
  const inTarball: string | null = whenTarballHas ? (tarball.files.find((file) => whenTarballHas.test(file)) ?? null) : null;
  if (inTarball) return inTarball;
  return whenSourceHas ? (sourceFiles.find((file) => whenSourceHas.test(file)) ?? null) : null;
}
