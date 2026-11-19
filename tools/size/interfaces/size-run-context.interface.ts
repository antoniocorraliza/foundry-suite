import type { BundleRequest } from './bundle-request.interface.ts';

export interface SizeRunContext {
  readonly repositoryRoot: string;
  readonly workDirectory: string;
  readonly bundleRequest: BundleRequest;
}
