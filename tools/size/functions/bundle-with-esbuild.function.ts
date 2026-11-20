import type { BuildResult, Plugin } from 'esbuild';
import { build } from 'esbuild';
import type { BundleRequest } from '../interfaces/bundle-request.interface.ts';
import type { ModuleResolution } from '../interfaces/module-resolution.interface.ts';
import { resolveFoundrySpecifier } from './resolve-foundry-specifier.function.ts';

export async function bundleWithEsbuild(request: BundleRequest): Promise<string> {
  const resolver: Plugin = {
    name: 'foundry-dist',
    setup: (pluginBuild) => {
      pluginBuild.onResolve({ filter: /^[^./]/ }, (arguments_) => {
        const resolution: ModuleResolution | null = resolveFoundrySpecifier(arguments_.path, request.entryFiles);
        return resolution === null ? null : { path: resolution.path, external: resolution.isExternal };
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
