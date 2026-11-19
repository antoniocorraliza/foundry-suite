import { describe, expect, it } from 'vitest';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import { undeclaredErrorClasses } from './undeclared-error-classes.function.ts';

const NETWORK: BuiltEntry = {
  packageFolder: 'foundry-core',
  entry: 'network',
  specifier: '@antoniocorraliza/foundry-core/network',
  file: '',
  exports: ['FoundrySessionRefreshError', 'FoundryOtherError', 'foundrySkipAuthentication'],
};

describe('undeclaredErrorClasses', () => {
  it('asks to declare every exported error class missing from the list', () => {
    const declared: Parameters<typeof undeclaredErrorClasses>[1] = [
      { packageFolder: 'foundry-core', entry: 'network', className: 'FoundrySessionRefreshError', constructorArguments: '' },
    ];
    expect(undeclaredErrorClasses([NETWORK], declared)).toEqual([
      '@antoniocorraliza/foundry-core/network exports FoundryOtherError: add it to tools/size/constants/public-error-classes.constant.ts',
    ]);
  });
});
