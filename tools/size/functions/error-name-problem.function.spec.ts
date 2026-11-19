import { describe, expect, it } from 'vitest';
import { errorNameProblem } from './error-name-problem.function.ts';

describe('errorNameProblem', () => {
  it('accepts the class name printed after minifying', () => {
    expect(errorNameProblem('@antoniocorraliza/foundry-utils', 'FoundryUtilsError', 'esbuild', 'FoundryUtilsError')).toBeNull();
  });

  it('reports a minified or inherited name', () => {
    expect(errorNameProblem('@antoniocorraliza/foundry-utils', 'FoundryUtilsError', 'rollup', 'e')).toBe(
      "FoundryUtilsError from @antoniocorraliza/foundry-utils [rollup]: error.name is 'e' after minifying; declare it as the literal 'FoundryUtilsError'",
    );
  });
});
