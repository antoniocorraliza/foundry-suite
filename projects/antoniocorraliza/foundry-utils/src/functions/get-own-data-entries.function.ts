/** Returns the own enumerable string-keyed data properties of an object, without running any getter. */
export function ɵgetFoundryOwnDataEntries(object: object): Array<[string, unknown]> {
  return Object.keys(object).flatMap((key) => {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, key);
    return descriptor !== undefined && 'value' in descriptor ? [[key, descriptor.value] as [string, unknown]] : [];
  });
}
