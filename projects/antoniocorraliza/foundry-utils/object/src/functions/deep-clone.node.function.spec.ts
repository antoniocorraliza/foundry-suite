import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { FoundryCloneError } from '../errors/foundry-clone.error';
import { deepClone } from './deep-clone.function';

describe('deepClone in Node', () => {
  it('throws on a view over a SharedArrayBuffer, instead of sharing its memory with the copy', () => {
    expect(catchError(() => deepClone({ counts: new Int32Array(new SharedArrayBuffer(8)) }), FoundryCloneError)).toMatchObject({
      path: ['counts'],
      valueDescription: 'class SharedArrayBuffer (view buffer)',
    });
  });
});
