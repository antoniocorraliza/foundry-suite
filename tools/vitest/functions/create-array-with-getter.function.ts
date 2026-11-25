/** Creates a copy of the items with a getter at one index that throws when it runs, to check that a function never runs it. */
export function createArrayWithGetter(items: ReadonlyArray<unknown>, getterIndex: number): Array<unknown> {
  return Object.defineProperty([...items], getterIndex, {
    get: (): never => {
      throw new Error('[test]: the getter ran');
    },
    enumerable: true,
  });
}
