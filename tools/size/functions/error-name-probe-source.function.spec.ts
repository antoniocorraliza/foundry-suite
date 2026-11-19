import { describe, expect, it } from 'vitest';
import { errorNameProbeSource } from './error-name-probe-source.function.ts';

describe('errorNameProbeSource', () => {
  it('prints the name of a new instance built with the declared arguments', () => {
    expect(
      errorNameProbeSource('@antoniocorraliza/foundry-utils', {
        packageFolder: 'foundry-utils',
        entry: '',
        className: 'FoundryUtilsError',
        constructorArguments: "'size check'",
      }),
    ).toBe(
      "import { FoundryUtilsError as ProbeError } from '@antoniocorraliza/foundry-utils';\nconsole.log(new ProbeError('size check').name);\n",
    );
  });

  it('loads the Angular compiler first for the Angular packages, which are partially compiled', () => {
    const source: string = errorNameProbeSource('@antoniocorraliza/foundry-core/http-client', {
      packageFolder: 'foundry-core',
      entry: 'http-client',
      className: 'FoundryApiError',
      constructorArguments: '{}',
    });
    expect(source.split('\n')[0]).toBe("import '@angular/compiler';");
  });
});
