import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCalendarDay } from '@antoniocorraliza/foundry-utils/date';
import type { FoundryFormDataEntries, FoundryFormDataFile, FoundryFormDataJson, FoundryFormDataValue } from './public-api';
import { createFormData } from './public-api';

declare const file: File;

describe('types of the form-data entry', () => {
  it('declares the public types as the design fixes them', () => {
    expectTypeOf<FoundryFormDataFile>().toEqualTypeOf<{
      readonly file: Blob;
      readonly fileName?: string;
      readonly contentType?: string;
    }>();
    expectTypeOf<FoundryFormDataJson>().toEqualTypeOf<{ readonly json: unknown }>();
    expectTypeOf<FoundryFormDataValue>().toEqualTypeOf<string | number | boolean | Blob | FoundryFormDataFile | FoundryFormDataJson>();
    expectTypeOf<FoundryFormDataEntries>().toEqualTypeOf<
      Readonly<Record<string, FoundryFormDataValue | ReadonlyArray<FoundryFormDataValue> | null | undefined>>
    >();
    expectTypeOf(createFormData).toEqualTypeOf<
      (entries: FoundryFormDataEntries, options?: { readonly arrayKeyStyle?: 'repeat' | 'brackets' }) => FormData
    >();
  });

  it('takes texts, calendar days, json parts and lists of files', () => {
    expectTypeOf(createFormData).toBeCallableWith({ day: '2026-03-01' as FoundryCalendarDay, priority: 2, isUrgent: false, note: null });
    expectTypeOf(createFormData).toBeCallableWith({ meta: { json: { a: 1 } } });
    expectTypeOf(createFormData).toBeCallableWith({ docs: [file, { file, fileName: 'a.pdf' }] });
  });

  it('does not take a Date or a Map, which cannot be sent as they are', () => {
    // @ts-expect-error a Date has to be formatted first
    expectTypeOf(createFormData).toBeCallableWith({ due: new Date() });
    // @ts-expect-error a Map is not a value of a form
    expectTypeOf(createFormData).toBeCallableWith({ m: new Map() });
  });
});
