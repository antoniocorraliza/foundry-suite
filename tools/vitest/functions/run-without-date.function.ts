function throwDateUsed(): never {
  throw new Error('[run-without-date]: the code used Date');
}

/** Runs an action with `globalThis.Date` replaced by a value that throws on any use, and restores it afterwards. */
export function runWithoutDate<T>(action: () => T): T {
  const originalDate: DateConstructor = globalThis.Date;
  globalThis.Date = new Proxy(originalDate, { construct: throwDateUsed, apply: throwDateUsed, get: throwDateUsed });
  try {
    return action();
  } finally {
    globalThis.Date = originalDate;
  }
}
