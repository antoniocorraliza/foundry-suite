import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import type { ThirdPartyNotice } from './third-party-notice.interface.ts';

export interface FoundryPackage {
  readonly folder: FoundryPackageFolder;
  readonly name: string;
  // Peers on other Foundry packages go in foundryPeers: their range is ^<version of that package>.
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly optionalPeers: ReadonlyArray<string>;
  readonly foundryPeers: ReadonlyArray<FoundryPackageFolder>;
  readonly sideEffects: false | ReadonlyArray<string>;
  readonly nonEntryExports: ReadonlyArray<string>;
  readonly notices: ReadonlyArray<ThirdPartyNotice>;
}
