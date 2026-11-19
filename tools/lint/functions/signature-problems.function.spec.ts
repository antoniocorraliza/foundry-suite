import { describe, expect, it } from 'vitest';
import { signatureProblems } from './signature-problems.function.ts';

const MESSAGE: string = 'signature on several lines: extract a named type for the parameters';

describe('signatureProblems', () => {
  it('accepts signatures on one line, with or without a decorator above', () => {
    const source: string = [
      'function clear(): void {}',
      'class Store {',
      '  @Input()',
      '  set value(value: string) {}',
      '  remove(key: string): void {}',
      '}',
      'const read = (key: string): string => key;',
    ].join('\n');
    expect(signatureProblems('a.ts', source)).toEqual([]);
  });

  it('reports a function, a method and an arrow constant split over several lines', () => {
    const source: string = [
      'function clear(',
      '  key: string,',
      '): void {}',
      'class Store {',
      '  remove(',
      '    key: string,',
      '  ): void {}',
      '}',
      'const read = (',
      '  key: string,',
      '): string => key;',
    ].join('\n');
    expect(signatureProblems('a.ts', source)).toEqual([`a.ts:1: ${MESSAGE}`, `a.ts:5: ${MESSAGE}`, `a.ts:9: ${MESSAGE}`]);
  });

  it('ignores a body that spans several lines', () => {
    expect(signatureProblems('a.ts', 'function clear(): void {\n  return;\n}')).toEqual([]);
  });
});
