import type { Bundler } from '../types/bundler.type.ts';
import type { BundleRequest } from './bundle-request.interface.ts';

export interface ErrorNameRequest {
  readonly bundle: BundleRequest;
  readonly bundler: Bundler;
  readonly outputFile: string;
}
