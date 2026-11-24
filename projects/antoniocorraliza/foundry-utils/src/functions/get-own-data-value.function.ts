/** Returns the value of an own data property of an object, or `null` when there is none, without running any getter. */
export function ɵgetOwnDataValue(object: unknown, name: string): unknown {
  if (typeof object !== 'object' || object === null || Array.isArray(object)) return null;
  const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, name);
  return descriptor !== undefined && 'value' in descriptor ? descriptor.value : null;
}
