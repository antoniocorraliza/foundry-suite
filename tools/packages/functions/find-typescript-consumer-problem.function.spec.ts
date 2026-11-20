import { describe, expect, it } from 'vitest';
import type { TypescriptConsumerCheck } from '../interfaces/typescript-consumer-check.interface.ts';
import { findTypescriptConsumerProblem } from './find-typescript-consumer-problem.function.ts';

const COMPILES: TypescriptConsumerCheck = { compiler: 'typescript-6.0', project: 'tsconfig.node.json', expectedError: null };
const REJECTS: TypescriptConsumerCheck = { compiler: 'typescript-5.5', project: 'tsconfig.commonjs.json', expectedError: 'TS1479' };
const TS1479: string =
  "src/consumer.cts(1,29): error TS1479: The current file is a CommonJS module whose imports will produce 'require' calls";

describe('findTypescriptConsumerProblem', () => {
  it('accepts a project that compiles when no error is expected', () => {
    expect(findTypescriptConsumerProblem(COMPILES, 0, '')).toBeNull();
  });

  it('reports the first error of a project that should compile', () => {
    expect(findTypescriptConsumerProblem(COMPILES, 2, "\nsrc/consumer.ts(3,1): error TS2307: Cannot find module 'x'.\n")).toBe(
      "typescript-6.0 tsconfig.node.json: expected to compile, got src/consumer.ts(3,1): error TS2307: Cannot find module 'x'.",
    );
  });

  it('accepts a project that fails only with the expected error', () => {
    expect(findTypescriptConsumerProblem(REJECTS, 2, `${TS1479}\n${TS1479}\n`)).toBeNull();
  });

  it('reports a project that compiles when an error is expected', () => {
    expect(findTypescriptConsumerProblem(REJECTS, 0, '')).toBe('typescript-5.5 tsconfig.commonjs.json: expected TS1479, but it compiled');
  });

  it('reports a project that fails with other errors besides the expected one', () => {
    expect(findTypescriptConsumerProblem(REJECTS, 2, `${TS1479}\nsrc/consumer.cts(2,1): error TS2304: Cannot find name 'File'.`)).toBe(
      `typescript-5.5 tsconfig.commonjs.json: expected only TS1479, got ${TS1479}`,
    );
  });

  it('reports a project that fails without any error code', () => {
    expect(findTypescriptConsumerProblem(REJECTS, 1, '')).toBe(
      'typescript-5.5 tsconfig.commonjs.json: expected only TS1479, got exit code 1',
    );
  });
});
