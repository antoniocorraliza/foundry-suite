/** Runs an action and returns what it throws, or `null` when it throws nothing. */
export function catchThrown(action: () => unknown): unknown {
  try {
    action();
  } catch (thrown) {
    return thrown;
  }
  return null;
}
