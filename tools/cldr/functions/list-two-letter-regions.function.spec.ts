import { describe, expect, it } from 'vitest';
import { listTwoLetterRegions } from './list-two-letter-regions.function.ts';

describe('listTwoLetterRegions', () => {
  it('lists the 676 codes of two capital letters in alphabetical order', () => {
    const regions: Array<string> = listTwoLetterRegions();
    expect([regions.length, regions[0], regions[1], regions.at(-1)]).toEqual([676, 'AA', 'AB', 'ZZ']);
  });
});
