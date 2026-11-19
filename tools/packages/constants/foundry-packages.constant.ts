import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';

const ANGULAR_RANGE: string = '>=21.0.0 <23.0.0';
const RXJS_RANGE: string = '^7.8.0';

// In build order: UI needs Utils compiled in dist/ to keep it out of its own bundle.
export const FOUNDRY_PACKAGES: ReadonlyArray<FoundryPackage> = [
  {
    folder: 'foundry-utils',
    name: '@antoniocorraliza/foundry-utils',
    peerDependencies: {},
    optionalPeers: [],
    foundryPeers: [],
    sideEffects: false,
    nonEntryExports: [],
    notices: [
      {
        description: 'Unicode license for the table derived from CLDR (getFirstDayOfWeek)',
        // The generated CLDR table must be named *.cldr.ts for this check to see it.
        whenSourceHas: /\.cldr\.ts$/,
        noticePath: 'UNICODE-LICENSE.txt',
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
    nonEntryExports: [],
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
    // Style sheets are imported only for their effect: without this a bundler could drop them.
    sideEffects: ['**/*.css'],
    nonEntryExports: ['./styles/*.css'],
    notices: [
      {
        description: 'SIL Open Font License of the bundled fonts (Inter and Urbanist)',
        whenTarballHas: /^styles\/fonts\/.+\.woff2$/,
        noticePath: 'styles/fonts/OFL.txt',
      },
    ],
  },
];
