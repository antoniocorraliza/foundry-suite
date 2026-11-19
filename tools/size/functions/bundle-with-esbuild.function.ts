import type { BuildResult, Plugin } from 'esbuild';
import { build } from 'esbuild';
import type { BundleRequest } from '../interfaces/bundle-request.interface.ts';
import type { ModuleResolution } from '../interfaces/module-resolution.interface.ts';
import { foundryResolution } from './foundry-resolution.function.ts';

export async function bundleWithEsbuild(request: BundleRequest): Promise<string> {
  const resolver: Plugin = {
    name: 'foundry-dist',
    setup: (pluginBuild) => {
      pluginBuild.onResolve({ filter: /^[^./]/ }, (arguments_) => {
        const resolution: ModuleResolution | undefined = foundryResolution(arguments_.path, request.entryFiles);
        return resolution === undefined ? undefined : { path: resolution.path, external: resolution.isExternal };
      });
    },
  };
  const result: BuildResult = await build({
    stdin: { contents: request.source, resolveDir: request.resolveDirectory, sourcefile: 'probe.mjs', loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
    plugins: [resolver],
  });
  return result.outputFiles?.[0]?.text ?? '';
}
