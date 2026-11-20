import { describe, expect, it } from 'vitest';
import { findErrorNameProblem } from './find-error-name-problem.function.ts';

describe('findErrorNameProblem', () => {
  it('accepts the class name printed after minifying', () => {
    expect(findErrorNameProblem('@antoniocorraliza/foundry-utils', 'FoundryUtilsError', 'esbuild', 'FoundryUtilsError')).toBeNull();
  });

  it('reports a minified or inherited name', () => {
    expect(findErrorNameProblem('@antoniocorraliza/foundry-utils', 'FoundryUtilsError', 'rollup', 'e')).toBe(
      "FoundryUtilsError from @antoniocorraliza/foundry-utils [rollup]: error.name is 'e' after minifying; declare it as the literal 'FoundryUtilsError'",
    );
  });
});
