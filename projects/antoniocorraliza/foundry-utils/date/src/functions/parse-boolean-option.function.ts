/**
 * Returns the value of a boolean option, or `false` when the option is missing.
 * @throws {TypeError} When the value is not a boolean.
 */
export function parseBooleanOption(options: Readonly<Record<string, unknown>> | undefined, name: string): boolean {
  const value: unknown = options?.[name] ?? false;
  if (typeof value !== 'boolean') throw new TypeError(`[foundry-utils]: the ${name} option must be a boolean, got ${String(value)}`);
  return value;
}
