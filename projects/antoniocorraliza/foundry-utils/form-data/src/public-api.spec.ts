import { describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [['createFormData', [{ a: 'x' }]]];

describe('public API of the form-data entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['createFormData']);
  });

  it('has a sample call for each export', () => {
    expect(SAMPLE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it('throws a TypeError through map, which passes the index as the options', () => {
    expect(catchThrown(() => [{ a: 'x' }].map(entry.createFormData as never))).toBeInstanceOf(TypeError);
  });

  it('can be imported without FormData, Blob or File, which it only reads when a function is called', async () => {
    vi.resetModules();
    vi.stubGlobal('FormData', undefined);
    vi.stubGlobal('Blob', undefined);
    vi.stubGlobal('File', undefined);
    await expect(import('./public-api')).resolves.toBeDefined();
    vi.unstubAllGlobals();
  });
});
