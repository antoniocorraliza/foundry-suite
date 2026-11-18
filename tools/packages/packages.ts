export const REPOSITORY_URL = 'git+https://github.com/antoniocorraliza/foundry-suite.git';
export const NODE_ENGINE = '>=22.12.0';
export const LICENSE_ID = 'MIT';

const ANGULAR_RANGE = '>=21.0.0 <23.0.0';
const RXJS_RANGE = '^7.8.0';

export type FoundryPackageFolder = 'foundry-utils' | 'foundry-core' | 'foundry-ui';

export interface ThirdPartyNotice {
  readonly description: string;
  readonly whenTarballHas?: RegExp;
  readonly whenSourceHas?: RegExp;
  readonly notice: string;
}

export interface FoundryPackage {
  readonly folder: FoundryPackageFolder;
  readonly name: string;
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly optionalPeers: readonly string[];
  readonly foundryPeers: readonly FoundryPackageFolder[];
  readonly sideEffects: false | readonly string[];
  readonly extraExports: readonly string[];
  readonly notices: readonly ThirdPartyNotice[];
}

export const FOUNDRY_PACKAGES: readonly FoundryPackage[] = [
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
