/*
 * The three published packages and what their manifests must say.
 * check-packages.ts compares every tarball against this file; strip-tslib.ts uses the folders.
 */

export const REPOSITORY_URL = 'git+https://github.com/antoniocorraliza/foundry-suite.git';
export const NODE_ENGINE = '>=22.12.0';
export const LICENSE_ID = 'MIT';

const ANGULAR_RANGE = '>=21.0.0 <23.0.0';
const RXJS_RANGE = '^7.8.0';

export type FoundryPackageFolder = 'foundry-utils' | 'foundry-core' | 'foundry-ui';

/** A third-party notice that must ship as soon as the third-party material it covers exists. */
export interface ThirdPartyNotice {
  readonly description: string;
  /** The notice is required when the TARBALL has a file whose path matches this pattern… */
  readonly whenTarballHas?: RegExp;
  /** …or when the package SOURCE folder has a file whose path matches this pattern. */
  readonly whenSourceHas?: RegExp;
  /** Path of the notice inside the tarball. */
  readonly notice: string;
}

export interface FoundryPackage {
  readonly folder: FoundryPackageFolder;
  readonly name: string;
  /** Exact peer ranges. Peers on other Foundry packages go in `foundryPeers`. */
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly optionalPeers: ReadonlyArray<string>;
  /** Foundry packages this one depends on as a peer. The expected range is `^<version of that package>`. */
  readonly foundryPeers: ReadonlyArray<FoundryPackageFolder>;
  readonly sideEffects: false | ReadonlyArray<string>;
  /** Export subpaths that do not come from an ng-packagr entry point. */
  readonly extraExports: ReadonlyArray<string>;
  readonly notices: ReadonlyArray<ThirdPartyNotice>;
}

/** In build order: UI needs the compiled Utils (it is a peer, not bundled), so Utils goes first. */
export const FOUNDRY_PACKAGES: ReadonlyArray<FoundryPackage> = [
  {
    folder: 'foundry-utils',
    name: '@antoniocorraliza/foundry-utils',
    peerDependencies: {},
    optionalPeers: [],
    foundryPeers: [],
    sideEffects: false,
    extraExports: [],
    notices: [
      {
        description: 'Unicode licence for the table derived from CLDR (getFirstDayOfWeek)',
        // Convention: the generated CLDR table lives in a file named `*.cldr.ts`.
        whenSourceHas: /\.cldr\.ts$/,
        notice: 'UNICODE-LICENSE.txt',
      },
    ],
  },
  {
    folder: 'foundry-core',
    name: '@antoniocorraliza/foundry-core',
    peerDependencies: {
      '@angular/common': ANGULAR_RANGE,
      '@angular/core': ANGULAR_RANGE,
      '@angular/router': ANGULAR_RANGE,
      rxjs: RXJS_RANGE,
    },
    optionalPeers: ['@angular/router'],
    foundryPeers: [],
    sideEffects: false,
    extraExports: [],
    notices: [],
  },
  {
    folder: 'foundry-ui',
    name: '@antoniocorraliza/foundry-ui',
    peerDependencies: {
      '@angular/common': ANGULAR_RANGE,
      '@angular/core': ANGULAR_RANGE,
      '@angular/forms': ANGULAR_RANGE,
      '@angular/router': ANGULAR_RANGE,
      rxjs: RXJS_RANGE,
    },
    optionalPeers: ['@angular/router'],
    foundryPeers: ['foundry-utils'],
    // The style sheets are imported for their effect: a bundler must never drop them.
    sideEffects: ['**/*.css'],
    extraExports: ['./styles/*.css'],
    notices: [
      {
        description: 'SIL Open Font License of the bundled fonts (Inter and Urbanist)',
        whenTarballHas: /^styles\/fonts\/.+\.woff2$/,
        notice: 'styles/fonts/OFL.txt',
      },
    ],
  },
];

export const PACKAGES_SOURCE_DIRECTORY = 'projects/antoniocorraliza';
export const PACKAGES_DIST_DIRECTORY = 'dist/antoniocorraliza';
