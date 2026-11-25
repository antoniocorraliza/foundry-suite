import { ɵgetValueKind, ɵgetValueTag, ɵisArrayIndex } from '@antoniocorraliza/foundry-utils';
import { BUILT_IN_PROTOTYPE_COUNT, TYPED_ARRAY_PROTOTYPE_COUNT } from '../constants/prototype-counts.constant';
import { FoundryCloneError } from '../errors/foundry-clone.error';
import type { CloneLocation } from '../interfaces/clone-location.interface';
import type { ViewParts } from '../interfaces/view-parts.interface';
import { readLastIndex } from './read-last-index.function';
import { readMapEntries } from './read-map-entries.function';
import { readSetValues } from './read-set-values.function';
import { readViewParts } from './read-view-parts.function';

function throwCloneError(location: CloneLocation, description: string): never {
  throw new FoundryCloneError({
    path: location.path,
    valueDescription: location.place === null ? description : `${description} (${location.place})`,
  });
}

function enterLocation(location: CloneLocation, key: string | number): CloneLocation {
  return location.place === null ? { path: [...location.path, key], place: null } : location;
}

function readConstructorName(prototype: object | null): string {
  const constructorValue: unknown = prototype === null ? null : Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;
  return typeof constructorValue === 'function' ? constructorValue.name : '';
}

function getClassName(value: object): string {
  const name: string = readConstructorName(Object.getPrototypeOf(value) as object | null);
  return `class ${name === '' ? 'without name' : name}`;
}

function readPrototypeAt(value: object | null, depth: number): object | null {
  if (value === null || depth === 0) return value;
  return readPrototypeAt(Object.getPrototypeOf(value) as object | null, depth - 1);
}

function checkBuiltInPrototype(value: object, className: string, prototypeCount: number, location: CloneLocation): void {
  const lastPrototype: object | null = readPrototypeAt(value, prototypeCount);
  const isBuiltIn: boolean =
    lastPrototype !== null &&
    Object.getPrototypeOf(lastPrototype) === null &&
    readConstructorName(Object.getPrototypeOf(value) as object | null) === className;
  if (!isBuiltIn) throwCloneError(location, getClassName(value));
}

function checkExtraProperties(value: object, description: string, isBuiltInKey: (key: string) => boolean, location: CloneLocation): void {
  Reflect.ownKeys(value).forEach((key) => {
    if (typeof key === 'symbol') throwCloneError(location, 'symbol key');
    if (!isBuiltInKey(key)) throwCloneError(enterLocation(location, key), description);
  });
}

function checkOwnProperties(value: object, location: CloneLocation, visited: WeakSet<object>): void {
  Reflect.ownKeys(value).forEach((key) => {
    if (typeof key === 'symbol') throwCloneError(location, 'symbol key');
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || (Array.isArray(value) && key === 'length')) return;
    if (Array.isArray(value) && !ɵisArrayIndex(key)) throwCloneError(enterLocation(location, key), 'array property');
    if (!('value' in descriptor)) throwCloneError(enterLocation(location, key), 'accessor');
    if (descriptor.enumerable !== true) throwCloneError(enterLocation(location, key), 'non-enumerable');
    const segment: string | number = Array.isArray(value) ? Number(key) : key;
    checkValue(descriptor.value, enterLocation(location, segment), visited);
  });
}

function checkView(view: object, location: CloneLocation, visited: WeakSet<object>): void {
  const parts: ViewParts = readViewParts(view);
  if (parts.typedArrayName === null) checkBuiltInPrototype(view, 'DataView', BUILT_IN_PROTOTYPE_COUNT, location);
  else checkBuiltInPrototype(view, parts.typedArrayName, TYPED_ARRAY_PROTOTYPE_COUNT, location);
  checkExtraProperties(view, 'view property', (key) => parts.typedArrayName !== null && ɵisArrayIndex(key), location);
  checkValue(parts.buffer, { path: location.path, place: location.place ?? 'view buffer' }, visited);
}

function checkValue(value: unknown, location: CloneLocation, visited: WeakSet<object>): void {
  if (typeof value === 'symbol') throwCloneError(location, 'symbol');
  if (typeof value === 'function') throwCloneError(location, 'function');
  if (typeof value !== 'object' || value === null || visited.has(value)) return;
  visited.add(value);
  switch (ɵgetValueKind(value)) {
    case 'plainObject':
      checkOwnProperties(value, location, visited);
      return;
    case 'array':
      checkBuiltInPrototype(value, 'Array', BUILT_IN_PROTOTYPE_COUNT, location);
      checkOwnProperties(value, location, visited);
      return;
    case 'map':
      checkBuiltInPrototype(value, 'Map', BUILT_IN_PROTOTYPE_COUNT, location);
      checkExtraProperties(value, 'Map property', () => false, location);
      readMapEntries(value).forEach(([key, entry]) => {
        checkValue(key, { path: location.path, place: location.place ?? 'Map key' }, visited);
        checkValue(entry, { path: location.path, place: location.place ?? 'Map value' }, visited);
      });
      return;
    case 'set':
      checkBuiltInPrototype(value, 'Set', BUILT_IN_PROTOTYPE_COUNT, location);
      checkExtraProperties(value, 'Set property', () => false, location);
      readSetValues(value).forEach((item) => checkValue(item, { path: location.path, place: location.place ?? 'Set element' }, visited));
      return;
    case 'date':
      checkBuiltInPrototype(value, 'Date', BUILT_IN_PROTOTYPE_COUNT, location);
      checkExtraProperties(value, 'Date property', () => false, location);
      return;
    case 'regExp':
      checkBuiltInPrototype(value, 'RegExp', BUILT_IN_PROTOTYPE_COUNT, location);
      checkExtraProperties(value, 'RegExp property', (key) => key === 'lastIndex', location);
      checkValue(readLastIndex(value), enterLocation(location, 'lastIndex'), visited);
      return;
    case 'arrayBuffer':
      checkBuiltInPrototype(value, 'ArrayBuffer', BUILT_IN_PROTOTYPE_COUNT, location);
      checkExtraProperties(value, 'ArrayBuffer property', () => false, location);
      return;
    case 'view':
      checkView(value, location, visited);
      return;
    case 'blob':
      return;
    case 'error':
      throwCloneError(location, 'Error');
      return;
    case 'weakCollection':
      throwCloneError(location, ɵgetValueTag(value).slice('[object '.length, -1));
      return;
    default:
      throwCloneError(location, getClassName(value));
  }
}

/**
 * Checks that a value can be copied without changing it.
 * @throws {FoundryCloneError} When a value cannot be copied without changing it.
 */
export function checkCloneable(value: unknown): void {
  checkValue(value, { path: [], place: null }, new WeakSet<object>());
}
