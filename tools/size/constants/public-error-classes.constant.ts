import type { PublicErrorClass } from '../interfaces/public-error-class.interface.ts';

export const PUBLIC_ERROR_CLASSES: ReadonlyArray<PublicErrorClass> = [
  {
    packageFolder: 'foundry-utils',
    entry: '',
    className: 'FoundryUtilsError',
    constructorArguments: "'size check'",
  },
  {
    packageFolder: 'foundry-utils',
    entry: '',
    className: 'FoundryCircularReferenceError',
    constructorArguments: "{ path: ['size', 0] }",
  },
  {
    packageFolder: 'foundry-utils',
    entry: '',
    className: 'FoundryCryptoUnavailableError',
    constructorArguments: "{ missingApi: 'crypto' }",
  },
  {
    packageFolder: 'foundry-utils',
    entry: 'case',
    className: 'FoundryKeyCollisionError',
    constructorArguments: "{ path: [], originalKeys: ['size_check', 'sizeCheck'], convertedKey: 'sizeCheck' }",
  },
  {
    packageFolder: 'foundry-utils',
    entry: 'object',
    className: 'FoundryCloneError',
    constructorArguments: "{ path: [], valueDescription: 'function' }",
  },
  {
    packageFolder: 'foundry-utils',
    entry: 'csv',
    className: 'FoundryCsvParseError',
    constructorArguments: "{ reason: 'unclosedQuote', line: 1, column: 1 }",
  },
  {
    packageFolder: 'foundry-utils',
    entry: 'browser',
    className: 'FoundryBrowserApiUnavailableError',
    constructorArguments: "{ missingApi: 'document' }",
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
