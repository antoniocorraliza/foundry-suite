import { describe, expect, it } from 'vitest';
import { findRepeatedSpecHelpers } from './find-repeated-spec-helpers.function.ts';

describe('findRepeatedSpecHelpers', () => {
  it('reports a top-level function declared in a second spec, with its line and the first spec', () => {
    const specTexts: ReadonlyMap<string, string> = new Map([
      ['a.spec.ts', "function createDate(): Date {\n  return new Date();\n}\ndescribe('a', () => {});\n"],
      ['b.spec.ts', "import { x } from './x';\n\nfunction createDate(): Date {\n  return new Date(0);\n}\n"],
    ]);
    expect(findRepeatedSpecHelpers(specTexts)).toEqual([
      'b.spec.ts:3: repeated test helper: createDate is also declared in a.spec.ts; move it to a shared file',
    ]);
  });

  it('reports a type declared in a second spec, also when it is not a function, and leaves interfaces of test data alone', () => {
    const specTexts: ReadonlyMap<string, string> = new Map([
      ['a.spec.ts', 'type LooseFunction = (...values: Array<unknown>) => unknown;\ninterface Ticket {\n  readonly id: string;\n}\n'],
      ['b.spec.ts', 'interface Ticket {\n  readonly subject: string;\n}\ntype LooseFunction = (...values: Array<unknown>) => unknown;\n'],
    ]);
    expect(findRepeatedSpecHelpers(specTexts)).toEqual([
      'b.spec.ts:4: repeated test helper: LooseFunction is also declared in a.spec.ts; move it to a shared file',
    ]);
  });

  it('accepts different names, functions inside a test and a helper imported from a shared file', () => {
    const specTexts: ReadonlyMap<string, string> = new Map([
      [
        'a.spec.ts',
        "import { createLocalTestDate } from '@foundry-test/functions/create-local-test-date.function';\nfunction readDay(): void {}\n",
      ],
      [
        'b.spec.ts',
        "import { createLocalTestDate } from '@foundry-test/functions/create-local-test-date.function';\nfunction readTime(): void {}\n",
      ],
      ['c.spec.ts', "it('reads', () => {\n  function readDay(): void {}\n  readDay();\n});\n"],
    ]);
    expect(findRepeatedSpecHelpers(specTexts)).toEqual([]);
  });
});
