/** Tells whether an options argument is missing or an object, which is what every options parameter accepts. */
export function ɵisFoundryOptionsValue(options: unknown): options is Readonly<Record<string, unknown>> | undefined {
  return options === undefined || (typeof options === 'object' && options !== null && !Array.isArray(options));
}
