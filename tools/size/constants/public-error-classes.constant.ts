import type { PublicErrorClass } from '../interfaces/public-error-class.interface.ts';

export const PUBLIC_ERROR_CLASSES: ReadonlyArray<PublicErrorClass> = [
  {
    packageFolder: 'foundry-utils',
    entry: '',
    className: 'FoundryUtilsError',
    constructorArguments: "'size check'",
  },
  {
    packageFolder: 'foundry-core',
    entry: 'network',
    className: 'FoundrySessionRefreshError',
    constructorArguments: "'size check', { reason: 'rejected', originalResponse: null }",
  },
  {
    packageFolder: 'foundry-core',
    entry: 'http-client',
    className: 'FoundryApiError',
    constructorArguments:
      "{ ok: false, kind: 'client', status: null, message: 'size check', details: [], errorBody: null, sessionEnded: false }",
  },
];
