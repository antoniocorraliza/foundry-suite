import { describe, expect, it } from 'vitest';
import { findFunctionOrderProblems } from './find-function-order-problems.function.ts';

describe('findFunctionOrderProblems', () => {
  it('accepts private functions before the exported one, and files without an exported function', () => {
    const source: string = 'function readDay(): void {}\nfunction readTime(): void {}\nexport function parseDate(): void {}\n';
    expect(findFunctionOrderProblems('a.function.ts', source)).toEqual([]);
    expect(findFunctionOrderProblems('main.ts', 'function readFiles(): void {}\nfunction main(): void {}\nmain();\n')).toEqual([]);
  });

  it('reports each private function after the exported one, with its line', () => {
    const source: string = 'function readDay(): void {}\nexport function parseDate(): void {}\n\nfunction readTime(): void {}\n';
    expect(findFunctionOrderProblems('a.function.ts', source)).toEqual([
      'a.function.ts:4: function order: readTime is private, so it goes before the exported function',
    ]);
  });
});
