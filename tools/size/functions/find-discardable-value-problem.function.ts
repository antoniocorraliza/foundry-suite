import type { DiscardableValue } from '../interfaces/discardable-value.interface.ts';

export function findDiscardableValueProblem(specifier: string, value: DiscardableValue, bundler: string, code: string): string | null {
  if (!code.includes(value.absentText)) return null;
  return `${value.valueName} from ${specifier} [${bundler}]: it stays in the bundle of ${value.keptSymbol} when it is imported and not used; mark it /* @__PURE__ */`;
}
