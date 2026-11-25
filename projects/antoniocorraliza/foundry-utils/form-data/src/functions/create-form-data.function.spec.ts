import { describe, expect, it } from 'vitest';
import { ɵcheckOptions, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { ARRAY_KEY_STYLES } from '../constants/array-key-styles.constant';
import type { FoundryFormDataEntries } from '../types/foundry-form-data-entries.type';
import { createFormData } from './create-form-data.function';

interface FilePart {
  readonly name: string;
  readonly type: string;
  readonly text: string;
}

type Part = [string, string | FilePart];

async function listParts(formData: FormData): Promise<Array<Part>> {
  const entries: Array<[string, FormDataEntryValue]> = Array.from(formData.entries());
  return Promise.all(
    entries.map(async ([key, value]): Promise<Part> => {
      if (typeof value === 'string') return [key, value];
      return [key, { name: value.name, type: value.type, text: await value.text() }];
    }),
  );
}

class Ticket {
  readonly subject: string = 'Hola';
}

describe('createFormData', () => {
  it('returns a new FormData of the environment each time', () => {
    const formData: FormData = createFormData({});
    expect(formData).toBeInstanceOf(globalThis.FormData);
    expect(createFormData({})).not.toBe(formData);
  });

  it('writes texts as they are, the empty one included, and calendar days and local date times as texts', async () => {
    const formData: FormData = createFormData({ subject: 'Hola', note: '', due: '2026-03-01', start: '2026-11-14T09:30' });
    expect(await listParts(formData)).toEqual([
      ['subject', 'Hola'],
      ['note', ''],
      ['due', '2026-03-01'],
      ['start', '2026-11-14T09:30'],
    ]);
  });

  it('writes finite numbers with String and booleans as true and false', async () => {
    const formData: FormData = createFormData({
      zero: 0,
      negativeZero: -0,
      large: 1e21,
      sum: 0.1 + 0.2,
      negative: -5,
      yes: true,
      no: false,
    });
    expect(await listParts(formData)).toEqual([
      ['zero', '0'],
      ['negativeZero', '0'],
      ['large', '1e+21'],
      ['sum', '0.30000000000000004'],
      ['negative', '-5'],
      ['yes', 'true'],
      ['no', 'false'],
    ]);
  });

  it('leaves out the keys whose value is null or undefined', async () => {
    expect(await listParts(createFormData({ first: null, second: undefined, third: 'x' }))).toEqual([['third', 'x']]);
  });

  it.each<[string, unknown]>([
    ['a Date', new Date(2026, 0, 1)],
    ['a Map', new Map()],
    ['a Set', new Set()],
    ['a class instance', new Ticket()],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
    ['a bigint', 1n],
    ['a symbol', Symbol('due')],
    ['a function', (): number => 1],
    ['a RegExp', /due/],
    ['an ArrayBuffer', new ArrayBuffer(1)],
    ['a Uint8Array', new Uint8Array(1)],
  ])('throws a TypeError with the key for %s, and never sends it with String', (_description, value) => {
    expect(catchError(() => createFormData({ subject: 'Hola', due: value } as never), TypeError).message).toContain('due');
  });

  it('sends a Blob as a file named blob, with its type and its bytes', async () => {
    const formData: FormData = createFormData({ data: new Blob(['{"a":1}'], { type: 'application/json' }) });
    expect(await listParts(formData)).toEqual([['data', { name: 'blob', type: 'application/json', text: '{"a":1}' }]]);
  });

  it('sends a File with its own name and type', async () => {
    const formData: FormData = createFormData({ doc: new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' }) });
    expect(await listParts(formData)).toEqual([['doc', { name: 'factura.pdf', type: 'application/pdf', text: '%PDF' }]]);
  });

  it('keeps the name of each file when two files share a key', async () => {
    const formData: FormData = createFormData({ docs: [new File(['a'], 'a.pdf'), new File(['b'], 'b.pdf')] });
    expect((await listParts(formData)).map(([key, part]) => [key, (part as FilePart).name])).toEqual([
      ['docs', 'a.pdf'],
      ['docs', 'b.pdf'],
    ]);
  });

  it('gives each file its own fileName and contentType, and keeps its bytes', async () => {
    const formData: FormData = createFormData({
      docs: [
        { file: new File(['a'], 'a.pdf', { type: 'application/pdf' }), fileName: 'contrato.pdf' },
        { file: new Blob(['b']), contentType: 'text/plain' },
        { file: new Blob(['c'], { type: 'text/csv' }), fileName: 'datos.csv', contentType: 'application/octet-stream' },
      ],
    });
    expect(await listParts(formData)).toEqual([
      ['docs', { name: 'contrato.pdf', type: 'application/pdf', text: 'a' }],
      ['docs', { name: 'blob', type: 'text/plain', text: 'b' }],
      ['docs', { name: 'datos.csv', type: 'application/octet-stream', text: 'c' }],
    ]);
  });

  it('leaves the content type as the Blob of the environment writes it', async () => {
    const formData: FormData = createFormData({ doc: { file: new Blob(['a']), contentType: 'Text/Plain' } });
    expect(await listParts(formData)).toEqual([['doc', { name: 'blob', type: 'text/plain', text: 'a' }]]);
  });

  it('keeps the file name of a File when the object has no fileName', async () => {
    const formData: FormData = createFormData({ doc: { file: new File(['a'], 'a.pdf') } });
    expect((await listParts(formData))[0]?.[1]).toMatchObject({ name: 'a.pdf' });
  });

  it.each<[string, unknown]>([
    ['a file that is not a Blob', { file: 'a.pdf' }],
    ['a file name that is not a text', { file: new Blob(['a']), fileName: 5 }],
    ['an empty file name', { file: new Blob(['a']), fileName: '' }],
    ['a content type that is not a text', { file: new Blob(['a']), contentType: 5 }],
    ['a file and a json', { file: new Blob(['a']), json: 1 }],
    ['a key that a file does not have', { file: new Blob(['a']), name: 'a.pdf' }],
    ['a key that a json does not have', { json: 1, contentType: 'application/json' }],
  ])('throws a TypeError with the key for an object with %s', (_description, value) => {
    expect(catchError(() => createFormData({ attachment: value } as never), TypeError).message).toContain('attachment');
  });

  it('sends a json object as a text part with its JSON, without a content type', async () => {
    const formData: FormData = createFormData({ metadata: { json: { priority: 2, tags: ['a'] } } });
    expect(await listParts(formData)).toEqual([['metadata', '{"priority":2,"tags":["a"]}']]);
  });

  it.each<[string, unknown, string]>([
    ['null', null, 'null'],
    ['a text', 'Hola', '"Hola"'],
    ['NaN', Number.NaN, 'null'],
    ['a Date, through its toJSON', new Date(0), '"1970-01-01T00:00:00.000Z"'],
  ])('writes %s inside json as JSON.stringify does', async (_description, json, text) => {
    expect(await listParts(createFormData({ metadata: { json } }))).toEqual([['metadata', text]]);
  });

  it.each<[string, unknown]>([
    ['undefined', undefined],
    ['a function', (): number => 1],
    ['a symbol', Symbol('metadata')],
  ])('throws a TypeError with the key for %s inside json, which JSON.stringify turns into undefined', (_description, json) => {
    expect(catchError(() => createFormData({ metadata: { json } } as never), TypeError).message).toContain('metadata');
  });

  it.each<[string, () => unknown]>([
    ['a bigint', () => ({ amount: 1n })],
    [
      'a cycle',
      () => {
        const cycle: Record<string, unknown> = {};
        cycle['self'] = cycle;
        return cycle;
      },
    ],
  ])(
    'throws a TypeError with the key and the original error as its cause when JSON.stringify throws for %s',
    (_description, createJson) => {
      const thrown: TypeError = catchError(() => createFormData({ metadata: { json: createJson() } } as never), TypeError);
      expect(thrown.message).toContain('metadata');
      expect(thrown.cause).toBeInstanceOf(TypeError);
    },
  );

  it.each<[string, unknown]>([
    ['an object without json or file', { name: 'Ana' }],
    ['an empty object', {}],
  ])('throws a TypeError with the key for %s, and never nests its keys', (_description, value) => {
    expect(catchError(() => createFormData({ user: value } as never), TypeError).message).toContain('user');
  });

  it('sends one part per element of a list, with the same key', async () => {
    expect(await listParts(createFormData({ tags: ['a', 1, true] }))).toEqual([
      ['tags', 'a'],
      ['tags', '1'],
      ['tags', 'true'],
    ]);
  });

  it('adds brackets to the key of every element of a list with arrayKeyStyle brackets, also with one element', async () => {
    expect(await listParts(createFormData({ tags: ['a', 'b'], ids: [1] }, { arrayKeyStyle: 'brackets' }))).toEqual([
      ['tags[]', 'a'],
      ['tags[]', 'b'],
      ['ids[]', '1'],
    ]);
  });

  it('adds nothing for an empty list', async () => {
    expect(await listParts(createFormData({ tags: [], subject: 'Hola' }))).toEqual([['subject', 'Hola']]);
  });

  it('leaves out null, undefined and holes inside a list', async () => {
    const tags: Array<string | null | undefined> = ['a', null, undefined];
    tags[4] = 'b';
    expect(await listParts(createFormData({ tags: tags as Array<string> }))).toEqual([
      ['tags', 'a'],
      ['tags', 'b'],
    ]);
  });

  it('throws a TypeError with the key for a list inside a list', () => {
    expect(catchError(() => createFormData({ matrix: [['a']] } as never), TypeError).message).toContain('matrix');
  });

  it('throws a TypeError with the key for a value inside a list that cannot be sent', () => {
    expect(catchError(() => createFormData({ dates: ['2026-03-01', new Date()] } as never), TypeError).message).toContain('dates');
  });

  it('writes the parts in the order of Object.keys: keys shaped like integers first, then the others as written', async () => {
    const formData: FormData = createFormData({ b: 'b', 10: 'ten', a: 'a', 2: 'two' });
    expect((await listParts(formData)).map(([key]) => key)).toEqual(['2', '10', 'b', 'a']);
  });

  it('takes an empty key as a field with an empty name, and adds the brackets even to a key that has them', async () => {
    expect(await listParts(createFormData({ '': 'x' }))).toEqual([['', 'x']]);
    expect(await listParts(createFormData({ 'docs[]': ['a'] }, { arrayKeyStyle: 'brackets' }))).toEqual([['docs[][]', 'a']]);
  });

  it('reads only the own enumerable data properties with a text key, and never runs a getter', async () => {
    let getterCalls: number = 0;
    const entries: Record<string | symbol, unknown> = { subject: 'Hola' };
    Object.defineProperty(entries, 'secret', {
      enumerable: true,
      get: (): string => {
        getterCalls += 1;
        return 'x';
      },
    });
    Object.defineProperty(entries, 'hidden', { enumerable: false, value: 'x' });
    entries[Symbol('tag')] = 'x';
    expect(await listParts(createFormData(entries as FoundryFormDataEntries))).toEqual([['subject', 'Hola']]);
    expect(getterCalls).toBe(0);
  });

  it('sends a __proto__ key read by JSON.parse as one more field', async () => {
    expect(await listParts(createFormData(JSON.parse('{"__proto__":"x","a":"y"}') as FoundryFormDataEntries))).toEqual([
      ['__proto__', 'x'],
      ['a', 'y'],
    ]);
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
    ['a text', 'subject=Hola'],
    ['a list', [['subject', 'Hola']]],
    ['a Map', new Map([['subject', 'Hola']])],
    ['a FormData', new FormData()],
    ['a class instance', new Ticket()],
  ])('throws a TypeError when the entries are %s, which is not a plain object', (_description, entries) => {
    expect(catchThrown(() => createFormData(entries as FoundryFormDataEntries))).toBeInstanceOf(TypeError);
  });

  it('rejects options that are not an object as checkOptions does', () => {
    expect(catchError(() => createFormData({ a: 'x' }, 'brackets' as never), TypeError).message).toBe(
      catchError(() => ɵcheckOptions('brackets', 'createFormData'), TypeError).message,
    );
  });

  it('rejects an unknown arrayKeyStyle as parseEnumOption does', () => {
    expect(catchError(() => createFormData({ a: ['x'] }, { arrayKeyStyle: 'Brackets' as 'repeat' }), TypeError).message).toBe(
      catchError(
        () => ɵparseEnumOption({ options: { arrayKeyStyle: 'Brackets' }, name: 'arrayKeyStyle', allowedValues: ARRAY_KEY_STYLES }),
        TypeError,
      ).message,
    );
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
  ])('repeats the key when arrayKeyStyle is %s', async (_description, arrayKeyStyle) => {
    expect(await listParts(createFormData({ a: ['x'] }, { arrayKeyStyle: arrayKeyStyle as 'repeat' }))).toEqual([['a', 'x']]);
  });

  it('throws a TypeError with the key and the original error as its cause when the FormData of the environment refuses a value', () => {
    const thrown: TypeError = catchError(
      () => createFormData({ doc: createObjectWithFakeTag('Blob') } as FoundryFormDataEntries),
      TypeError,
    );
    expect(thrown.message).toContain('doc');
    expect(thrown.cause).toBeInstanceOf(TypeError);
  });

  it('sends texts, a number, files with their names and a json part', async () => {
    const files: Array<File> = [new File(['a'], 'captura.png', { type: 'image/png' }), new File(['b'], 'log.txt', { type: 'text/plain' })];
    const formData: FormData = createFormData({
      subject: 'No arranca',
      priority: 2,
      attachments: files,
      metadata: { json: { source: 'web' } },
    });
    expect(await listParts(formData)).toEqual([
      ['subject', 'No arranca'],
      ['priority', '2'],
      ['attachments', { name: 'captura.png', type: 'image/png', text: 'a' }],
      ['attachments', { name: 'log.txt', type: 'text/plain', text: 'b' }],
      ['metadata', '{"source":"web"}'],
    ]);
  });

  it('leaves its entries and options unchanged', () => {
    const entries: FrozenSnapshot<FoundryFormDataEntries> = freezeAndSnapshot<FoundryFormDataEntries>({
      subject: 'Hola',
      tags: ['a', 'b'],
      doc: { file: new Blob(['a']), fileName: 'a.txt', contentType: 'text/plain' },
      metadata: { json: { nested: [1, { deep: true }] } },
    });
    const options: FrozenSnapshot<{ readonly arrayKeyStyle: 'brackets' }> = freezeAndSnapshot({ arrayKeyStyle: 'brackets' } as const);
    createFormData(entries.value, options.value);
    expect(entries.listChanges()).toEqual([]);
    expect(options.listChanges()).toEqual([]);
  });
});
