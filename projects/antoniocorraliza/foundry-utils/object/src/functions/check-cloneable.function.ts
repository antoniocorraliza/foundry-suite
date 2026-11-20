import { ɵgetFoundryValueKind, ɵgetFoundryValueTag } from '@antoniocorraliza/foundry-utils';
import { FoundryCloneError } from '../errors/foundry-clone.error';
import type { CloneLocation } from '../interfaces/clone-location.interface';

function fail(location: CloneLocation, description: string): never {
  throw new FoundryCloneError({
    path: location.path,
    valueDescription: location.place === null ? description : `${description} (${location.place})`,
  });
}

function inside(location: CloneLocation, key: string | number): CloneLocation {
  return location.place === null ? { path: [...location.path, key], place: null } : location;
}

function className(value: object): string {
  const prototype: unknown = Object.getPrototypeOf(value);
  const constructorValue: unknown =
    typeof prototype === 'object' && prototype !== null ? Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value : null;
  const name: string = typeof constructorValue === 'function' ? constructorValue.name : '';
  return `class ${name === '' ? 'without name' : name}`;
}

function checkOwnProperties(value: object, location: CloneLocation, visited: WeakSet<object>): void {
  Reflect.ownKeys(value).forEach((key) => {
    if (typeof key === 'symbol') fail(location, 'symbol key');
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || (Array.isArray(value) && key === 'length')) return;
    if (!('value' in descriptor)) fail(inside(location, key), 'accessor');
    if (descriptor.enumerable !== true) fail(inside(location, key), 'non-enumerable');
    const segment: string | number = Array.isArray(value) && /^\d+$/.test(key) ? Number(key) : key;
    checkValue(descriptor.value, inside(location, segment), visited);
  });
}

function checkValue(value: unknown, location: CloneLocation, visited: WeakSet<object>): void {
  if (typeof value === 'symbol') fail(location, 'symbol');
  if (typeof value === 'function') fail(location, 'function');
  if (typeof value !== 'object' || value === null || visited.has(value)) return;
  visited.add(value);
  switch (ɵgetFoundryValueKind(value)) {
    case 'plainObject':
    case 'array':
      checkOwnProperties(value, location, visited);
      return;
    case 'map':
      Array.from(Map.prototype.entries.call(value) as Iterable<[unknown, unknown]>).forEach(([key, entry]) => {
        checkValue(key, { path: location.path, place: location.place ?? 'Map key' }, visited);
        checkValue(entry, { path: location.path, place: location.place ?? 'Map value' }, visited);
      });
      return;
    case 'set':
      Array.from(Set.prototype.values.call(value) as Iterable<unknown>).forEach((item) =>
        checkValue(item, { path: location.path, place: location.place ?? 'Set element' }, visited),
      );
      return;
    case 'date':
    case 'regExp':
    case 'arrayBuffer':
    case 'view':
    case 'blob':
      return;
    case 'error':
      fail(location, 'Error');
      return;
    case 'weakCollection':
      fail(location, ɵgetFoundryValueTag(value).slice('[object '.length, -1));
      return;
    default:
      fail(location, className(value));
  }
}

/**
 * Checks that a value can be copied without changing it.
 * @throws {FoundryCloneError} When a value cannot be copied without changing it.
 */
export function checkCloneable(value: unknown): void {
  checkValue(value, { path: [], place: null }, new WeakSet<object>());
}
