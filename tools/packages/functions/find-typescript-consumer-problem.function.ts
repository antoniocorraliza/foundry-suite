import type { TypescriptConsumerCheck } from '../interfaces/typescript-consumer-check.interface.ts';

export function findTypescriptConsumerProblem(check: TypescriptConsumerCheck, exitCode: number, output: string): string | null {
  const name: string = `${check.compiler} ${check.project}`;
  const errorCodes: Array<string> = Array.from(output.matchAll(/error (TS\d+)/g), (match) => match[1] ?? '');
  const firstLine: string = output.split('\n').find((line) => line.trim() !== '') ?? `exit code ${exitCode}`;
  if (check.expectedError === null) return exitCode === 0 ? null : `${name}: expected to compile, got ${firstLine}`;
  if (exitCode === 0) return `${name}: expected ${check.expectedError}, but it compiled`;
  const unexpectedCodes: Array<string> = errorCodes.filter((code) => code !== check.expectedError);
  if (errorCodes.length === 0 || unexpectedCodes.length > 0) return `${name}: expected only ${check.expectedError}, got ${firstLine}`;
  return null;
}
