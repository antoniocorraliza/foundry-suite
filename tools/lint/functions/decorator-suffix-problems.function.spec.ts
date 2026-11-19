import { describe, expect, it } from 'vitest';
import { decoratorSuffixProblems } from './decorator-suffix-problems.function.ts';

describe('decoratorSuffixProblems', () => {
  it.each([
    ['ui/panel/src/components/foundry-panel/foundry-panel.component.ts', "@Component({ selector: 'foundry-panel' })"],
    ['ui/panel/src/directives/foundry-panel-trigger.directive.ts', "@Directive({ selector: '[foundryPanelTrigger]' })"],
    ['core/storage/src/services/foundry-storage.service.ts', "@Injectable({ providedIn: 'root' })"],
    ['ui/elements/src/pipes/foundry-initials.pipe.ts', "@Pipe({ name: 'foundryInitials' })"],
    ['core/storage/src/functions/define-foundry-storage-key.function.ts', 'export function defineFoundryStorageKey(): void {}'],
  ])('accepts %s', (path, line) => {
    expect(decoratorSuffixProblems(path, `${line}\nexport class Probe {}\n`)).toEqual([]);
  });

  it('reports a decorated class in a file without the suffix of its kind', () => {
    const text: string = "@Injectable({ providedIn: 'root' })\nexport class FoundryPanelState {}\n";
    expect(decoratorSuffixProblems('ui/panel/src/functions/panel-state.ts', text)).toEqual([
      'ui/panel/src/functions/panel-state.ts: a class with @Injectable goes in a file that ends in .service.ts',
    ]);
  });

  it('ignores a decorator that is not at the start of a line', () => {
    expect(decoratorSuffixProblems('tools/probe/probe.ts', "const text: string = '@Component(';\n")).toEqual([]);
  });
});
