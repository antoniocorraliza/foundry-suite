import type { FrozenSnapshot } from '../interfaces/frozen-snapshot.interface.ts';

function getTag(value: object): string {
  return Object.prototype.toString.call(value);
}

function getBytes(value: object): string {
  const view: Uint8Array = ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    : new Uint8Array(value as ArrayBuffer);
  return Array.from(view, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Freezing a typed array with elements throws, and its bytes are covered by the fingerprint.
function freezeDeeply(value: unknown, seen: WeakSet<object>): void {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null || seen.has(value)) return;
  seen.add(value);
  if (ArrayBuffer.isView(value)) return;
  if (getTag(value) === '[object Map]') {
    Map.prototype.forEach.call(value, (entry, key) => [key, entry].forEach((item) => freezeDeeply(item, seen)));
  }
  if (getTag(value) === '[object Set]') Set.prototype.forEach.call(value, (item) => freezeDeeply(item, seen));
  Object.values(Object.getOwnPropertyDescriptors(value)).forEach((descriptor) => freezeDeeply(descriptor.value, seen));
  Object.freeze(value);
}

function describeContent(value: object, path: string, lines: Array<string>, ids: Map<object, number>): void {
  const tag: string = getTag(value);
  if (tag === '[object Date]') lines.push(`${path} time ${Date.prototype.getTime.call(value)}`);
  if (tag === '[object Map]') {
    const entries: Array<[unknown, unknown]> = Array.from(Map.prototype.entries.call(value) as Iterable<[unknown, unknown]>);
    lines.push(`${path} size ${entries.length}`);
    entries.forEach(([key, entry], index) => {
      writeFingerprint(key, `${path}<key ${index}>`, lines, ids);
      writeFingerprint(entry, `${path}<value ${index}>`, lines, ids);
    });
  }
  if (tag === '[object Set]') {
    const items: Array<unknown> = Array.from(Set.prototype.values.call(value) as Iterable<unknown>);
    lines.push(`${path} size ${items.length}`);
    items.forEach((item, index) => writeFingerprint(item, `${path}<element ${index}>`, lines, ids));
  }
  if (tag === '[object ArrayBuffer]' || ArrayBuffer.isView(value)) lines.push(`${path} bytes ${getBytes(value)}`);
  Reflect.ownKeys(value).forEach((key) => {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, key);
    const keyPath: string = `${path}.${String(key)}`;
    if (descriptor === undefined) return;
    if ('value' in descriptor) writeFingerprint(descriptor.value, keyPath, lines, ids);
    else lines.push(`${keyPath} accessor`);
  });
}

function writeFingerprint(value: unknown, path: string, lines: Array<string>, ids: Map<object, number>): void {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    lines.push(`${path} = ${typeof value} ${Object.is(value, -0) ? '-0' : String(value)}`);
    return;
  }
  const knownId: number | undefined = ids.get(value);
  if (knownId !== undefined) {
    lines.push(`${path} -> #${knownId}`);
    return;
  }
  const id: number = ids.size;
  ids.set(value, id);
  lines.push(`${path} #${id} ${getTag(value)}`);
  describeContent(value, path, lines, ids);
}

function createFingerprint(value: unknown): Array<string> {
  const lines: Array<string> = [];
  writeFingerprint(value, 'value', lines, new Map<object, number>());
  return lines;
}

// Object.freeze does not protect the internal slots of Date, Map and Set, nor the bytes of a buffer: the fingerprint does.
export function freezeAndSnapshot<T>(value: T): FrozenSnapshot<T> {
  const before: Array<string> = createFingerprint(value);
  freezeDeeply(value, new WeakSet<object>());
  return {
    value,
    listChanges: (): Array<string> => {
      const after: Array<string> = createFingerprint(value);
      const removed: Array<string> = before.filter((line) => !after.includes(line)).map((line) => `- ${line}`);
      const added: Array<string> = after.filter((line) => !before.includes(line)).map((line) => `+ ${line}`);
      return [...removed, ...added];
    },
  };
}
