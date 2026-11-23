import { fileURLToPath } from 'node:url';
import type { Alias } from 'vite';
import type { TestProjectInlineConfiguration } from 'vitest/config';
import { PACKAGES_SOURCE_DIRECTORY } from '../../packages/constants/packages-source-directory.constant.ts';

// Vite does not read the tsconfig paths, so the tests resolve the Foundry packages to their source, and @foundry-test to tools/vitest, with these aliases.
function createSourceAliases(): Array<Alias> {
  const directory: string = fileURLToPath(new URL(`../../../${PACKAGES_SOURCE_DIRECTORY}`, import.meta.url));
  const testDirectory: string = fileURLToPath(new URL('..', import.meta.url));
  return [
    { find: /^@antoniocorraliza\/(foundry-(?:core|ui|utils))$/, replacement: `${directory}/$1/src/public-api.ts` },
    { find: /^@antoniocorraliza\/(foundry-(?:core|ui|utils))\/([a-z-]+)$/, replacement: `${directory}/$1/$2/src/public-api.ts` },
    { find: /^@foundry-test\/(.+)$/, replacement: `${testDirectory}$1` },
  ];
}

export function addSourceAliases(project: TestProjectInlineConfiguration): TestProjectInlineConfiguration {
  return { ...project, resolve: { ...project.resolve, alias: createSourceAliases() } };
}
