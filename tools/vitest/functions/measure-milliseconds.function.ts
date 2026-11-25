/** Runs an action and returns the milliseconds it took, read with `performance.now()`. */
export function measureMilliseconds(action: () => unknown): number {
  const start: number = performance.now();
  action();
  return performance.now() - start;
}
