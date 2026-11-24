/**
 * Downloads a Blob or a File with that name, after replacing the characters that a file name cannot have. Only in a browser.
 * @throws {TypeError} When the Blob or the name are not valid.
 * @throws {FoundryBrowserApiUnavailableError} When `document`, `URL.createObjectURL` or `URL.revokeObjectURL` is missing.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  throw new Error('[foundry-utils]: downloadBlob is not implemented yet');
}
