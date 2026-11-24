import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from './download-blob.function';

interface ClickedLink {
  readonly href: string;
  readonly download: string;
  readonly isInBody: boolean;
  readonly isInDocument: boolean;
}

describe('downloadBlob with a document', () => {
  let clickedLinks: Array<ClickedLink>;
  let createObjectUrl: MockInstance<typeof URL.createObjectURL>;
  let revokeObjectUrl: MockInstance<typeof URL.revokeObjectURL>;

  beforeEach(() => {
    clickedLinks = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedLinks.push({
        href: this.href,
        download: this.download,
        isInBody: this.parentNode === document.body,
        isInDocument: this.isConnected,
      });
    });
    createObjectUrl = vi.spyOn(URL, 'createObjectURL');
    revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clicks a link to the URL of the Blob with the name as its download attribute, inside the body', () => {
    const blob: Blob = new Blob(['a,b\r\n'], { type: 'text/csv;charset=utf-8' });
    expect(downloadBlob(blob, 'tickets.csv')).toBeUndefined();
    expect(createObjectUrl).toHaveBeenCalledExactlyOnceWith(blob);
    const url: string = createObjectUrl.mock.results[0]?.value as string;
    expect(clickedLinks).toEqual([{ href: url, download: 'tickets.csv', isInBody: true, isInDocument: true }]);
  });

  it('removes the link from the document right after the click', () => {
    downloadBlob(new Blob(['a']), 'a.csv');
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it.each([
    ['Factura 2026/03.csv', 'Factura 2026-03.csv'],
    ['CON.csv', '_CON.csv'],
    ['...', 'download'],
  ])('downloads %j with the sanitized name %j', (fileName, download) => {
    downloadBlob(new Blob(['a']), fileName);
    expect(clickedLinks.map((link) => link.download)).toEqual([download]);
  });

  it('revokes the URL forty seconds after the click, not at once', () => {
    vi.useFakeTimers();
    downloadBlob(new Blob(['a']), 'a.csv');
    const url: string = createObjectUrl.mock.results[0]?.value as string;
    expect(revokeObjectUrl).not.toHaveBeenCalled();
    vi.advanceTimersByTime(39_999);
    expect(revokeObjectUrl).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(revokeObjectUrl).toHaveBeenCalledExactlyOnceWith(url);
  });

  it('downloads a File too', () => {
    downloadBlob(new File(['a'], 'origen.txt'), 'destino.txt');
    expect(clickedLinks.map((link) => link.download)).toEqual(['destino.txt']);
  });

  it('puts the link in the root element when the document has no body', () => {
    vi.spyOn(Document.prototype, 'body', 'get').mockReturnValue(null as never);
    downloadBlob(new Blob(['a']), 'a.csv');
    expect(clickedLinks.map((link) => link.isInDocument)).toEqual([true]);
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it('takes a Blob created in another window by its tag', () => {
    const frame: HTMLIFrameElement = document.createElement('iframe');
    document.body.append(frame);
    try {
      const ForeignBlob: typeof Blob = (frame.contentWindow as unknown as { Blob: typeof Blob }).Blob;
      createObjectUrl.mockReturnValue('blob:probe');
      const blob: Blob = new ForeignBlob(['a']);
      expect(blob).not.toBeInstanceOf(Blob);
      downloadBlob(blob, 'a.csv');
      expect(createObjectUrl).toHaveBeenCalledExactlyOnceWith(blob);
      expect(clickedLinks.map((link) => link.download)).toEqual(['a.csv']);
    } finally {
      frame.remove();
    }
  });
});
