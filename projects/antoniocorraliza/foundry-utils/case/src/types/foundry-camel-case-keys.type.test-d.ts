import { describe, expectTypeOf, it } from 'vitest';
import { toCamelCaseKeys } from '../functions/to-camel-case-keys.function';
import type { FoundryCamelCaseKeys } from './foundry-camel-case-keys.type';

class Owner {
  firstName: string = '';

  getLabel(): string {
    return this.firstName;
  }
}

class DataOnly {
  first_name: string = '';
}

interface TicketDto {
  readonly ticket_id: string;
  readonly due_date?: Date;
  readonly line_items: ReadonlyArray<{ readonly unit_price: number }>;
}

type Nested<Levels extends number, Depth extends Array<unknown> = []> = Depth['length'] extends Levels
  ? { leaf_value: string }
  : { next_level: Nested<Levels, [...Depth, unknown]> };
type Dig<T, Depth extends Array<unknown>> = Depth['length'] extends 20
  ? T
  : T extends { readonly nextLevel: infer Next }
    ? Dig<Next, [...Depth, unknown]>
    : T;

describe('FoundryCamelCaseKeys', () => {
  it('computes the camelCase model from the wire shape, in depth', () => {
    expectTypeOf<FoundryCamelCaseKeys<TicketDto>>().toEqualTypeOf<{
      readonly ticketId: string;
      readonly dueDate?: Date;
      readonly lineItems: ReadonlyArray<{ readonly unitPrice: number }>;
    }>();
    expectTypeOf(toCamelCaseKeys({ user_name: '' })).toEqualTypeOf<{ userName: string }>();
  });

  it('keeps unknown as unknown and any as any', () => {
    expectTypeOf<FoundryCamelCaseKeys<unknown>>().toEqualTypeOf<unknown>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the contract for an any input is any
    expectTypeOf<FoundryCamelCaseKeys<any>>().toBeAny();
  });

  it('leaves built-in objects as they are', () => {
    expectTypeOf(toCamelCaseKeys({ due_date: new Date() })).toEqualTypeOf<{ dueDate: Date }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Map<string, number> }>>().toEqualTypeOf<{ aB: Map<string, number> }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Set<string> }>>().toEqualTypeOf<{ aB: Set<string> }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: File }>>().toEqualTypeOf<{ aB: File }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Blob }>>().toEqualTypeOf<{ aB: Blob }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: RegExp }>>().toEqualTypeOf<{ aB: RegExp }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Uint8Array }>>().toEqualTypeOf<{ aB: Uint8Array }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Error }>>().toEqualTypeOf<{ aB: Error }>();
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: Promise<number> }>>().toEqualTypeOf<{ aB: Promise<number> }>();
  });

  it('leaves a class with methods as it is', () => {
    expectTypeOf<FoundryCamelCaseKeys<{ owner_user: Owner }>>().toEqualTypeOf<{ ownerUser: Owner }>();
  });

  it('types a class without methods as converted, although the value is kept by reference at run time', () => {
    expectTypeOf<FoundryCamelCaseKeys<{ owner_user: DataOnly }>>().toEqualTypeOf<{ ownerUser: { firstName: string } }>();
  });

  it('keeps tuples as tuples and numeric keys as they are', () => {
    expectTypeOf<FoundryCamelCaseKeys<[{ a_b: number }, string]>>().toEqualTypeOf<[{ aB: number }, string]>();
    expectTypeOf<FoundryCamelCaseKeys<{ 1: string }>>().toEqualTypeOf<{ 1: string }>();
  });

  it('leaves symbol keys out of the type', () => {
    const symbolKey: unique symbol = Symbol('s');
    expectTypeOf<FoundryCamelCaseKeys<{ a_b: number; [symbolKey]: number }>>().toEqualTypeOf<{ aB: number }>();
  });

  it('types keys longer than 64 characters as string', () => {
    type LongKey = 'this_key_has_more_than_sixty_four_characters_for_the_limit_of_types';
    expectTypeOf<FoundryCamelCaseKeys<Record<LongKey, number>>>().toEqualTypeOf<Record<string, number>>();
  });

  it('compiles a 60-character key and a 12-level object without an excessive depth error', () => {
    type SixtyKey = 'this_key_has_exactly_sixty_characters_for_the_compiler_test_';
    expectTypeOf<FoundryCamelCaseKeys<Record<SixtyKey, number>>>().toHaveProperty('thisKeyHasExactlySixtyCharactersForTheCompilerTest_');
    expectTypeOf<FoundryCamelCaseKeys<Nested<12>>>().toHaveProperty('nextLevel');
  });

  it('maps a 12-level object to the leaf and types what lies beyond 16 levels as unknown', () => {
    expectTypeOf<Dig<FoundryCamelCaseKeys<Nested<12>>, []>>().toEqualTypeOf<{ leafValue: string }>();
    expectTypeOf<Dig<FoundryCamelCaseKeys<Nested<20>>, []>>().toBeUnknown();
  });

  it('does not compile as a callback of map, which would pass the index as options', () => {
    // @ts-expect-error the index of map is not an options object
    [{ a_b: 1 }].map(toCamelCaseKeys);
  });
});
