import { describe, expect, it } from 'vitest';
import type { FrozenSnapshot } from '../interfaces/frozen-snapshot.interface.ts';
import { freezeAndSnapshot } from './freeze-and-snapshot.function.ts';

describe('freezeAndSnapshot', () => {
  it('returns the same value, frozen in depth', () => {
    const input: FrozenSnapshot<{ customer: { name: string }; lines: Array<{ amount: number }> }> = freezeAndSnapshot({
      customer: { name: 'Ana' },
      lines: [{ amount: 1 }],
    });
    expect(Object.isFrozen(input.value)).toBe(true);
    expect(Object.isFrozen(input.value.customer)).toBe(true);
    expect(Object.isFrozen(input.value.lines[0])).toBe(true);
    expect(() => {
      (input.value.customer as { name: string }).name = 'Eva';
    }).toThrow(TypeError);
  });

  it('reports no changes when nothing was touched', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 2, 1), tags: new Set(['a']), map: new Map([['k', 1]]) });
    expect(input.listChanges()).toEqual([]);
  });

  it('catches a function that changes the time of a date it received', () => {
    const input: FrozenSnapshot<{ due: Date }> = freezeAndSnapshot({ due: new Date(2026, 2, 1, 10) });
    input.value.due.setHours(0, 0, 0, 0);
    expect(input.listChanges()).not.toEqual([]);
  });

  it('catches entries added to a frozen Map or Set', () => {
    const input: FrozenSnapshot<{ map: Map<string, number>; set: Set<number> }> = freezeAndSnapshot({
      map: new Map<string, number>(),
      set: new Set<number>(),
    });
    input.value.map.set('k', 1);
    input.value.set.add(1);
    expect(input.listChanges().filter((line) => line.endsWith('size 1'))).toHaveLength(2);
  });

  it('accepts typed arrays without throwing and catches a changed byte', () => {
    const input: FrozenSnapshot<{ bytes: Uint8Array; buffer: ArrayBuffer }> = freezeAndSnapshot({
      bytes: new Uint8Array([1, 2, 3]),
      buffer: new ArrayBuffer(2),
    });
    input.value.bytes[0] = 9;
    expect(input.listChanges().some((line) => line.includes('bytes'))).toBe(true);
  });

  it('handles cycles', () => {
    const node: { self?: unknown } = {};
    node.self = node;
    expect(freezeAndSnapshot(node).listChanges()).toEqual([]);
  });

  it('never runs a getter', () => {
    const value: { readonly explosive: number } = {
      get explosive(): number {
        throw new Error('[test]: the getter ran');
      },
    };
    expect(freezeAndSnapshot(value).listChanges()).toEqual([]);
  });

  it('makes a start-of-day function that changes its input fail', () => {
    function setStartOfDayInPlace(date: Date): Date {
      date.setHours(0, 0, 0, 0);
      return date;
    }
    const input: FrozenSnapshot<Date> = freezeAndSnapshot(new Date(2026, 2, 1, 10));
    setStartOfDayInPlace(input.value);
    expect(input.listChanges()).not.toEqual([]);
  });
});
