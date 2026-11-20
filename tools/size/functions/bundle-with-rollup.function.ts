import type { Plugin, RollupBuild, RollupOutput } from 'rollup';
import { rollup } from 'rollup';
import type { MinifyOutput } from 'terser';
import { minify } from 'terser';
import { PROBE_MODULE } from '../constants/probe-module.constant.ts';
import type { BundleRequest } from '../interfaces/bundle-request.interface.ts';
import type { ModuleResolution } from '../interfaces/module-resolution.interface.ts';
import { resolveFoundrySpecifier } from './resolve-foundry-specifier.function.ts';

export async function bundleWithRollup(request: BundleRequest): Promise<string> {
  const plugin: Plugin = {
    name: 'foundry-size',
    resolveId: (specifier) => {
      if (specifier === PROBE_MODULE) return specifier;
      const resolution: ModuleResolution | null = resolveFoundrySpecifier(specifier, request.entryFiles);
      return resolution === null ? null : { id: resolution.path, external: resolution.isExternal };
    },
    load: (id) => (id === PROBE_MODULE ? request.source : null),
    renderChunk: async (code) => {
      const minified: MinifyOutput = await minify(code, { module: true, ecma: 2020 });
      return minified.code ?? code;
    },
  };
  const bundle: RollupBuild = await rollup({ input: PROBE_MODULE, plugins: [plugin], onwarn: () => null });
  try {
    const output: RollupOutput = await bundle.generate({ format: 'es' });
    return output.output[0].code;
  } finally {
    await bundle.close();
  }
}
