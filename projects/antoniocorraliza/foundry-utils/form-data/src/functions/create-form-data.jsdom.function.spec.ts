import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { createFormData } from './create-form-data.function';

describe('createFormData with jsdom', () => {
  it('returns the FormData of jsdom', () => {
    expect(createFormData({ a: 'x' })).toBeInstanceOf(globalThis.FormData);
  });

  it('sends a File of jsdom with its name and type, as a file and not as a text', () => {
    const doc: File = new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' });
    expect(Object.prototype.toString.call(doc)).toBe('[object File]');
    const part: FormDataEntryValue | null = createFormData({ doc }).get('doc');
    expect(typeof part).not.toBe('string');
    expect((part as File).name).toBe('factura.pdf');
    expect((part as File).type).toBe('application/pdf');
    expect((part as File).size).toBe(4);
  });

  it('sends a Blob of jsdom as a file named blob', () => {
    const part: FormDataEntryValue | null = createFormData({ data: new Blob(['{"a":1}'], { type: 'application/json' }) }).get('data');
    expect((part as File).name).toBe('blob');
    expect((part as File).type).toBe('application/json');
  });

  it('gives a File of jsdom its own name and content type, and keeps its bytes', () => {
    const doc: File = new File(['abc'], 'a.bin');
    const part: FormDataEntryValue | null = createFormData({ doc: { file: doc, fileName: 'b.txt', contentType: 'text/plain' } }).get('doc');
    expect((part as File).name).toBe('b.txt');
    expect((part as File).type).toBe('text/plain');
    expect((part as File).size).toBe(3);
  });

  it.each<[string, () => unknown]>([
    ['Blob', () => new NodeBlob(['a'])],
    ['File', () => new NodeFile(['a'], 'a.txt')],
  ])(
    'throws a TypeError with the key, and never sends a text, for a %s of Node that the FormData of jsdom refuses',
    (_kind, createValue) => {
      const thrown: TypeError = catchError(() => createFormData({ doc: createValue() as Blob }), TypeError);
      expect(thrown.message).toMatch(/^\[foundry-utils\]: /);
      expect(thrown.message).toContain('doc');
      expect((thrown.cause as Error).name).toBe('TypeError');
    },
  );
});
