class Unrelated {}

/** Creates a class instance whose `Symbol.toStringTag` fakes a built-in type, to check that a function does not trust the tag. */
export function createObjectWithFakeTag(tag: string): object {
  return Object.defineProperty(new Unrelated(), Symbol.toStringTag, { value: tag });
}
