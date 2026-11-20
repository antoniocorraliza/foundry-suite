/** Writes an own enumerable property, so that a key named `__proto__` never changes the prototype. */
export function ɵdefineOwnProperty(target: object, key: string, value: unknown): void {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}
