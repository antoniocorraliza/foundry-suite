export interface ThirdPartyNotice {
  readonly description: string;
  readonly whenTarballHas?: RegExp;
  readonly whenSourceHas?: RegExp;
  readonly noticePath: string;
}
