import type { FoundryObjectPath, ɵValueKind } from '@antoniocorraliza/foundry-utils';
import { ɵcheckOptions, ɵgetOwnDataEntries, ɵgetValueKind, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { ARRAY_MODES } from '../constants/array-modes.constant';
import type { DifferenceWalk } from '../interfaces/difference-walk.interface';
import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';
import type { FoundryObjectDifference } from '../interfaces/foundry-object-difference.interface';
import type { CustomEquality } from '../types/custom-equality.type';
import { areValuesEqual } from './are-values-equal.function';

function parseCustomEquality(options: Readonly<Record<string, unknown>> | undefined): CustomEquality | null {
  const customEquality: unknown = options?.['customEquality'];
  if (customEquality === undefined) return null;
  if (typeof customEquality !== 'function') throw new TypeError('[foundry-utils]: the customEquality option must be a function');
  return customEquality as CustomEquality;
}

function isFirstVisit(walk: DifferenceWalk, previous: object, current: object): boolean {
  const seen: WeakSet<object> = walk.visited.get(previous) ?? new WeakSet<object>();
  if (seen.has(current)) return false;
  seen.add(current);
  walk.visited.set(previous, seen);
  return true;
}

function createAddedDifference(path: FoundryObjectPath, current: unknown): FoundryObjectDifference {
  // eslint-disable-next-line no-restricted-syntax -- an added value has no previous value
  return { path, kind: 'added', previous: undefined, current };
}

function createRemovedDifference(path: FoundryObjectPath, previous: unknown): FoundryObjectDifference {
  // eslint-disable-next-line no-restricted-syntax -- a removed value has no current value
  return { path, kind: 'removed', previous, current: undefined };
}

function compareEntries(walk: DifferenceWalk, previous: object, current: object, path: FoundryObjectPath): void {
  const currentValues: Map<string, unknown> = new Map<string, unknown>(ɵgetOwnDataEntries(current));
  const previousKeys: Set<string> = new Set<string>();
  ɵgetOwnDataEntries(previous).forEach(([key, value]) => {
    previousKeys.add(key);
    if (!currentValues.has(key)) walk.differences.push(createRemovedDifference([...path, key], value));
    else compareValues(walk, value, currentValues.get(key), [...path, key]);
  });
  currentValues.forEach((value, key) => {
    if (!previousKeys.has(key)) walk.differences.push(createAddedDifference([...path, key], value));
  });
}

function compareItems(walk: DifferenceWalk, previous: unknown, current: unknown, path: FoundryObjectPath): void {
  const previousItems: ReadonlyArray<unknown> = previous as ReadonlyArray<unknown>;
  const currentItems: ReadonlyArray<unknown> = current as ReadonlyArray<unknown>;
  const length: number = Math.max(previousItems.length, currentItems.length);
  for (let index: number = 0; index < length; index++) {
    if (index >= currentItems.length) walk.differences.push(createRemovedDifference([...path, index], previousItems[index]));
    else if (index >= previousItems.length) walk.differences.push(createAddedDifference([...path, index], currentItems[index]));
    else compareValues(walk, previousItems[index], currentItems[index], [...path, index]);
  }
}

function compareValues(walk: DifferenceWalk, previous: unknown, current: unknown, path: FoundryObjectPath): void {
  const isCustomEqual: boolean | undefined = walk.customEquality?.(previous, current);
  if (isCustomEqual === true) return;
  const previousKind: ɵValueKind = ɵgetValueKind(previous);
  const currentKind: ɵValueKind = ɵgetValueKind(current);
  const isWalkable: boolean =
    isCustomEqual === undefined &&
    previousKind === currentKind &&
    (previousKind === 'plainObject' || (previousKind === 'array' && walk.arrayMode === 'byIndex'));
  if (!isWalkable) {
    if (isCustomEqual === false || !areValuesEqual(previous, current, walk.customEquality)) {
      walk.differences.push({ path, kind: 'changed', previous, current });
    }
    return;
  }
  if (!isFirstVisit(walk, previous as object, current as object)) return;
  if (previousKind === 'array') compareItems(walk, previous, current, path);
  else compareEntries(walk, previous as object, current as object, path);
}

/**
 * Lists the values added, removed or changed between two values, each with its path.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getObjectDifferences(
  previous: unknown,
  current: unknown,
  options?: { readonly arrays?: 'atomic' | 'byIndex' } & FoundryDeepEqualOptions,
): ReadonlyArray<FoundryObjectDifference> {
  ɵcheckOptions(options, 'getObjectDifferences');
  const walk: DifferenceWalk = {
    arrayMode: ɵparseEnumOption({ options, name: 'arrays', allowedValues: ARRAY_MODES, fallback: 'atomic' }),
    customEquality: parseCustomEquality(options),
    differences: [],
    visited: new WeakMap<object, WeakSet<object>>(),
  };
  compareValues(walk, previous, current, []);
  return walk.differences;
}
