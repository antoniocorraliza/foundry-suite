import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { FoundryBrowserApiUnavailableError } from '../errors/foundry-browser-api-unavailable.error';
import { downloadBlob } from './download-blob.function';

describe('downloadBlob with jsdom', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not throw, because jsdom runs with the URL of Node, and clicks a link that downloads nothing', () => {
    const click: unknown = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    expect(() => downloadBlob(new Blob(['a']), 'a.csv')).not.toThrow();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each<[string, Record<string, unknown>, string]>([
    ['createObjectURL', { revokeObjectURL: () => undefined }, 'URL.createObjectURL'],
    ['revokeObjectURL', { createObjectURL: () => 'blob:probe' }, 'URL.revokeObjectURL'],
    ['both URL functions', {}, 'URL.createObjectURL'],
  ])('throws a FoundryBrowserApiUnavailableError without %s, before creating anything', (_description, urlApi, missingApi) => {
    const createObjectUrl: unknown = vi.fn(() => 'blob:probe');
    vi.stubGlobal('URL', { ...urlApi, ...('createObjectURL' in urlApi ? { createObjectURL: createObjectUrl } : {}) });
    const createElement: unknown = vi.spyOn(document, 'createElement');
    const thrown: FoundryBrowserApiUnavailableError = catchError(
      () => downloadBlob(new Blob(['a']), 'a.csv'),
      FoundryBrowserApiUnavailableError,
    );
    expect(thrown.missingApi).toBe(missingApi);
    expect(createObjectUrl).not.toHaveBeenCalled();
    expect(createElement).not.toHaveBeenCalled();
  });

  it('looks for the document before the URL functions', () => {
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('URL', {});
    expect(catchError(() => downloadBlob(new Blob(['a']), 'a.csv'), FoundryBrowserApiUnavailableError).missingApi).toBe('document');
  });
});
