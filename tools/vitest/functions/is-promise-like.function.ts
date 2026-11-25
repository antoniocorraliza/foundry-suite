/** Tells whether a value is a promise or has a `then` method, so `await` would wait for it. */
export function isPromiseLike(value: unknown): boolean {
  return value instanceof Promise || (typeof value === 'object' && value !== null && typeof Reflect.get(value, 'then') === 'function');
}
