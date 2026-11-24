import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { FoundryBrowserApiUnavailableError } from '../errors/foundry-browser-api-unavailable.error';
import { downloadBlob } from './download-blob.function';

describe('downloadBlob on Node', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws a FoundryBrowserApiUnavailableError for the missing document, before creating a URL', () => {
    const createObjectUrl: unknown = vi.spyOn(URL, 'createObjectURL');
    const thrown: unknown = catchThrown(() => downloadBlob(new Blob(['a']), 'a.csv'));
    expect(thrown).toBeInstanceOf(FoundryBrowserApiUnavailableError);
    expect((thrown as FoundryBrowserApiUnavailableError).missingApi).toBe('document');
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it.each<[string, unknown, unknown]>([
    ['a text instead of a Blob', 'a,b', 'a.csv'],
    ['bytes instead of a Blob', new Uint8Array([1]), 'a.csv'],
    ['a plain object instead of a Blob', {}, 'a.csv'],
    ['null instead of a Blob', null, 'a.csv'],
    ['a name that is not a text', new Blob(['a']), 5],
    ['a missing name', new Blob(['a']), undefined],
  ])('throws a TypeError for %s, before looking for the APIs of the browser', (_description, blob, fileName) => {
    expect(catchThrown(() => downloadBlob(blob as Blob, fileName as string))).toBeInstanceOf(TypeError);
  });

  it.each(['Blob', 'File'])('takes an object with the tag %s as a Blob, whatever its class', (tag) => {
    const thrown: unknown = catchThrown(() => downloadBlob(createObjectWithFakeTag(tag) as Blob, 'a.csv'));
    expect((thrown as FoundryBrowserApiUnavailableError).missingApi).toBe('document');
  });
});
