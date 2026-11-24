import { describe, expectTypeOf, it } from 'vitest';
import { capitalizeFirstLetter, parseBoolean, toSlug, toTitleCase, truncateText } from './public-api';

describe('types of the text entry', () => {
  it('returns what the design fixes', () => {
    expectTypeOf(capitalizeFirstLetter).returns.toEqualTypeOf<string>();
    expectTypeOf(toTitleCase).returns.toEqualTypeOf<string>();
    expectTypeOf(truncateText).returns.toEqualTypeOf<string>();
    expectTypeOf(toSlug).returns.toEqualTypeOf<string>();
    expectTypeOf(parseBoolean).returns.toEqualTypeOf<boolean | null>();
  });

  it('takes any value in parseBoolean and only texts in the others', () => {
    expectTypeOf(parseBoolean).parameter(0).toEqualTypeOf<unknown>();
    // @ts-expect-error the text must be a string
    toSlug(5);
  });
});
