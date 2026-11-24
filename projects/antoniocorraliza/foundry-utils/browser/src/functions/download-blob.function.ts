import { ɵgetValueTag } from '@antoniocorraliza/foundry-utils';
import { BLOB_TAGS } from '../constants/blob-tags.constant';
import { URL_REVOCATION_DELAY } from '../constants/download-timing.constant';
import { FoundryBrowserApiUnavailableError } from '../errors/foundry-browser-api-unavailable.error';
import { sanitizeFileName } from './sanitize-file-name.function';

/**
 * Downloads a Blob or a File with that name, after replacing the characters that a file name cannot have. Only in a browser.
 * @throws {TypeError} When the Blob or the name are not valid.
 * @throws {FoundryBrowserApiUnavailableError} When `document`, `URL.createObjectURL` or `URL.revokeObjectURL` is missing.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (!BLOB_TAGS.includes(ɵgetValueTag(blob))) {
    throw new TypeError(`[foundry-utils]: downloadBlob needs a Blob or a File, got ${String(blob)}`);
  }
  if (typeof fileName !== 'string') {
    throw new TypeError(`[foundry-utils]: the name of downloadBlob must be a string, got ${String(fileName)}`);
  }
  if (typeof document === 'undefined') throw new FoundryBrowserApiUnavailableError({ missingApi: 'document' });
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new FoundryBrowserApiUnavailableError({ missingApi: 'URL.createObjectURL' });
  }
  if (typeof URL.revokeObjectURL !== 'function') throw new FoundryBrowserApiUnavailableError({ missingApi: 'URL.revokeObjectURL' });
  const url: string = URL.createObjectURL(blob);
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = url;
  link.download = sanitizeFileName(fileName);
  (document.body ?? document.documentElement).append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), URL_REVOCATION_DELAY);
}
