import { describe, expect, it } from 'vitest';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import { findUndeclaredErrorClasses } from './find-undeclared-error-classes.function.ts';

const NETWORK: BuiltEntry = {
  packageFolder: 'foundry-core',
  entry: 'network',
  specifier: '@antoniocorraliza/foundry-core/network',
  file: '',
  exports: ['FoundrySessionRefreshError', 'FoundryOtherError', 'foundrySkipAuthentication'],
};

describe('findUndeclaredErrorClasses', () => {
  it('asks to declare every exported error class missing from the list', () => {
    const declared: Parameters<typeof findUndeclaredErrorClasses>[1] = [
      { packageFolder: 'foundry-core', entry: 'network', className: 'FoundrySessionRefreshError', constructorArguments: '' },
    ];
    expect(findUndeclaredErrorClasses([NETWORK], declared)).toEqual([
      '@antoniocorraliza/foundry-core/network exports FoundryOtherError: add it to tools/size/constants/public-error-classes.constant.ts',
    ]);
  });
});
