import type { PackageRepository } from './package-repository.interface.ts';
import type { PeerDependencyMeta } from './peer-dependency-meta.interface.ts';

export interface PackageManifest {
  readonly name?: string;
  readonly version?: string;
  readonly license?: string;
  readonly type?: string;
  readonly module?: string;
  readonly typings?: string;
  readonly sideEffects?: unknown;
  readonly engines?: Readonly<Record<string, string>>;
  readonly repository?: PackageRepository;
  readonly exports?: Readonly<Record<string, unknown>>;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly optionalDependencies?: Readonly<Record<string, string>>;
  readonly bundleDependencies?: unknown;
  readonly bundledDependencies?: unknown;
  readonly peerDependencies?: Readonly<Record<string, string>>;
  readonly peerDependenciesMeta?: Readonly<Record<string, PeerDependencyMeta>>;
}
