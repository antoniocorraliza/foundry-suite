# The Foundry Suite

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Monorepo of The Foundry Suite 2.0: three libraries for Angular and TypeScript.

| Package                           | What it is                                    |
| :-------------------------------- | :-------------------------------------------- |
| `@antoniocorraliza/foundry-core`  | Infrastructure layer for Angular applications |
| `@antoniocorraliza/foundry-ui`    | Angular components                            |
| `@antoniocorraliza/foundry-utils` | Framework-agnostic TypeScript utilities       |

## Status

**Version 2.0 is in development.** It has not been released and it is not ready for use.

Version 1.x is deprecated on npm: it has known defects and must not be used in new projects. Its code is archived in the repository [antoniocorraliza/foundry](https://github.com/antoniocorraliza/foundry) (branch `1.x`, tag `v1.26.66`).

## Development

Node 24 (see `.nvmrc`).

```bash
npm ci
npm run lint
npm test
npm run build            # utils → core → ui
npm run check:packages   # checks what goes inside each tarball
```

## License

[MIT](LICENSE) © 2026 Antonio Corraliza León.
