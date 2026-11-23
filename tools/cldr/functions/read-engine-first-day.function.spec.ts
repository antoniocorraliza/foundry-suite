import { describe, expect, it } from 'vitest';
import { readEngineFirstDay } from './read-engine-first-day.function.ts';

describe('readEngineFirstDay', () => {
  it('gives the first day of the week of a region, with Sunday as 0', () => {
    expect([readEngineFirstDay('US'), readEngineFirstDay('ES'), readEngineFirstDay('MV'), readEngineFirstDay('EG')]).toEqual([0, 1, 5, 6]);
  });

  it('gives null for an old code that the engine replaces with another region', () => {
    expect(readEngineFirstDay('BU')).toBeNull();
  });
});
