export async function runWithConcurrency<T>(tasks: ReadonlyArray<() => Promise<T>>, limit: number): Promise<Array<T>> {
  const results: Array<T> = new Array<T>(tasks.length);
  let next: number = 0;
  const worker = async (): Promise<void> => {
    while (next < tasks.length) {
      const index: number = next;
      next += 1;
      const task: (() => Promise<T>) | undefined = tasks[index];
      if (task) results[index] = await task();
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, () => worker()));
  return results;
}
