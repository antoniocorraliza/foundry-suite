/** Tells whether a value is a plain object: null prototype, or a prototype whose constructor is `Object` in any context. */
export function ɵisFoundryPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype === null) return true;
  if (Object.getPrototypeOf(prototype) !== null) return false;
  const constructorDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(prototype, 'constructor');
  const constructorValue: unknown = constructorDescriptor?.value;
  return typeof constructorValue === 'function' && constructorValue.name === 'Object';
}
