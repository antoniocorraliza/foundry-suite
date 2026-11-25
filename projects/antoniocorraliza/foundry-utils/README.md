# Foundry Utils

[![License: MIT AND Unicode-3.0](https://img.shields.io/badge/license-MIT%20AND%20Unicode--3.0-blue.svg)](LICENSE)

Framework-agnostic TypeScript utilities of The Foundry Suite.

## Status

**Version 2.0 is in development.** It has not been released and it is not ready for use.

Version 1.x is deprecated on npm: it has known defects and must not be used in new projects. Its code is archived in the repository [antoniocorraliza/foundry](https://github.com/antoniocorraliza/foundry) (branch `1.x`, tag `v1.26.66`).

## Install

Version 2.0 is not published yet. Its release candidates will be published with the `next` tag:

```bash
npm install @antoniocorraliza/foundry-utils@next
```

It has no dependencies and no peer dependencies.

## Compatibility

- Node 22.12 or later.
- ES modules only. Every entry is imported on its own, such as `@antoniocorraliza/foundry-utils/object`, `@antoniocorraliza/foundry-utils/case` or `@antoniocorraliza/foundry-utils/date`.
- TypeScript 5.5 or later, with `moduleResolution` set to `bundler` or `nodenext`. A CommonJS file (`.cts`) that imports it compiles with TypeScript 6.0 and 7.0, and fails with 5.5 (TS1479). `node10` is not supported: the secondary entries do not resolve.
- Jest 30 with `jest-environment-jsdom`, with the recipe below. Not tested with `ts-jest`.
- `/date` and `/csv` are tested in the time zones `Europe/Madrid`, `America/Mexico_City`, `America/Santiago` and `UTC`, plus `Pacific/Apia` and `Australia/Lord_Howe` for their clock changes.

### Jest

Jest loads test files as CommonJS and does not transform `node_modules`, so it fails on this package with "Must use import to load ES Module". Let Babel transform it:

```bash
npm install --save-dev jest jest-environment-jsdom @babel/core @babel/preset-env
```

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: { '\\.[cm]?js$': 'babel-jest' },
  transformIgnorePatterns: ['/node_modules/(?!@antoniocorraliza/foundry-utils/)'],
};
```

```js
// babel.config.js
module.exports = { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] };
```

`readCsvFile` needs `TextDecoder` and `Blob.prototype.arrayBuffer`, which `jest-environment-jsdom` lacks: there it rejects with a `TypeError` that names them. `sha256` and `sha512` reject with `FoundryCryptoUnavailableError`, because the `crypto` of jsdom has no `crypto.subtle`. A test that reads a file or computes a hash runs in the `node` environment, with this comment at the top of the file:

```js
/** @jest-environment node */
```

## License

[MIT](LICENSE) © 2026 Antonio Corraliza León.

The first day of the week of `getFirstDayOfWeek` comes from Unicode CLDR 48, under the [Unicode License v3](UNICODE-LICENSE.txt).
