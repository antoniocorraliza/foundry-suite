# Foundry Utils

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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
- ES modules only. Every entry is imported on its own: `@antoniocorraliza/foundry-utils/object`, `@antoniocorraliza/foundry-utils/case`.
- TypeScript 5.5 or later, with `moduleResolution` set to `bundler` or `nodenext`. A CommonJS file (`.cts`) that imports it compiles with TypeScript 6.0 and 7.0, and fails with 5.5 (TS1479). `node10` is not supported: the secondary entries do not resolve.
- Jest 30 with `jest-environment-jsdom`, with the recipe below. Not tested with `ts-jest`.

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

## License

[MIT](LICENSE) © 2026 Antonio Corraliza León.
