/** Runs an action with the week data of `Intl.Locale` removed, as in an engine without it, and restores it afterwards. */
export function runWithoutWeekData<T>(action: () => T): T {
  const prototype: object = Intl.Locale.prototype;
  const descriptors: Array<[string, PropertyDescriptor | undefined]> = ['weekInfo', 'getWeekInfo'].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(prototype, key),
  ]);
  descriptors.forEach(([key]) => Reflect.deleteProperty(prototype, key));
  try {
    return action();
  } finally {
    descriptors.forEach(([key, descriptor]) => {
      if (descriptor !== undefined) Object.defineProperty(prototype, key, descriptor);
    });
  }
}
