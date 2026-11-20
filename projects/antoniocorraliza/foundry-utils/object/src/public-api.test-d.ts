import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCloneError, FoundryObjectDifference, FoundryWithoutEmptyValues } from './public-api';
import {
  deepClone,
  getObjectDifferences,
  isPlainObject,
  moveArrayItem,
  omitProperties,
  pickProperties,
  removeEmptyValues,
} from './public-api';

interface Ticket {
  readonly id: string;
  readonly title: string | null;
  readonly due?: Date | undefined;
  readonly lines: ReadonlyArray<{ readonly note: string | null }>;
}

describe('types of the object entry', () => {
  it('narrows a value with isPlainObject', () => {
    const value: unknown = {};
    if (isPlainObject(value)) expectTypeOf(value).toEqualTypeOf<Readonly<Record<string, unknown>>>();
  });

  it('keeps the type with deepClone', () => {
    expectTypeOf(deepClone({ due: new Date() })).toEqualTypeOf<{ due: Date }>();
  });

  it('gives exact types to pickProperties and omitProperties', () => {
    const ticket: Ticket = { id: 'x', title: null, lines: [] };
    expectTypeOf(pickProperties(ticket, ['id'])).toEqualTypeOf<Pick<Ticket, 'id'>>();
    expectTypeOf(omitProperties(ticket, ['title'])).toEqualTypeOf<Omit<Ticket, 'title'>>();
    // @ts-expect-error only keys of the object are accepted
    pickProperties(ticket, ['missing']);
  });

  it('returns a mutable array from moveArrayItem', () => {
    expectTypeOf(moveArrayItem([1, 2] as ReadonlyArray<number>, 0, 1)).toEqualTypeOf<Array<number>>();
  });

  it('returns read-only differences', () => {
    expectTypeOf(getObjectDifferences({}, {})).toEqualTypeOf<ReadonlyArray<FoundryObjectDifference>>();
  });

  it('removes null and undefined from properties in depth, keeping dates and the items of arrays', () => {
    expectTypeOf<FoundryWithoutEmptyValues<Ticket>>().toEqualTypeOf<{
      readonly id: string;
      readonly title?: string;
      readonly due?: Date;
      readonly lines: ReadonlyArray<{ readonly note?: string }>;
    }>();
    expectTypeOf(removeEmptyValues({ list: [1, null] })).toEqualTypeOf<{ list: Array<number | null> }>();
    expectTypeOf(removeEmptyValues({ list: [1, null] }, { removeEmptyArrayItems: true })).toEqualTypeOf<{ list: Array<number> }>();
  });

  it('does not compile as a callback of map, which would pass the index as options', () => {
    // @ts-expect-error the index of map is not an options object
    [{ a: null }].map(removeEmptyValues);
  });

  it('declares the name of the clone error as its literal', () => {
    expectTypeOf<FoundryCloneError['name']>().toEqualTypeOf<'FoundryCloneError'>();
  });
});
