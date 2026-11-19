// Required as soon as the tarball, or the source folder of the package, has a file that matches.
export interface ThirdPartyNotice {
  readonly description: string;
  readonly whenTarballHas?: RegExp;
  readonly whenSourceHas?: RegExp;
  // Path inside the tarball.
  readonly notice: string;
}
