import { describe, expect, it } from 'vitest';
import { createAngularProbeSource } from './create-angular-probe-source.function.ts';

describe('createAngularProbeSource', () => {
  const baseComponent: Parameters<typeof createAngularProbeSource>[0] = {
    path: '/repository/size-base-app.component',
    className: 'SizeBaseAppComponent',
  };

  it('differs from the base app only in the import and the values kept', () => {
    const base: Array<string> = createAngularProbeSource(baseComponent, []).split('\n');
    const probe: Array<string> = createAngularProbeSource(baseComponent, [
      { specifier: '@antoniocorraliza/foundry-ui/icon', symbols: 'whole-entry' },
    ]).split('\n');
    expect(probe.filter((line) => !base.includes(line))).toEqual([
      "import * as probe0 from '@antoniocorraliza/foundry-ui/icon';",
      'console.log([probe0]);',
    ]);
  });

  it('bootstraps the base component with the router and HttpClient', () => {
    expect(createAngularProbeSource(baseComponent, [])).toContain(
      'bootstrapApplication(SizeBaseAppComponent, { providers: [provideRouter([]), provideHttpClient(withFetch())] })',
    );
  });
});
