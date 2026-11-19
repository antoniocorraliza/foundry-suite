export interface PackageManifest {
  readonly name?: string;
  readonly version?: string;
  readonly license?: string;
  readonly type?: string;
  readonly module?: string;
  readonly typings?: string;
  readonly sideEffects?: unknown;
  readonly engines?: Readonly<Record<string, string>>;
  readonly repository?: { readonly url?: string; readonly directory?: string };
  readonly exports?: Readonly<Record<string, unknown>>;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly optionalDependencies?: Readonly<Record<string, string>>;
  readonly bundleDependencies?: unknown;
  readonly bundledDependencies?: unknown;
  readonly peerDependencies?: Readonly<Record<string, string>>;
  readonly peerDependenciesMeta?: Readonly<Record<string, { readonly optional?: boolean }>>;
}
