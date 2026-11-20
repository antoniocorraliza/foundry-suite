import type { TestProjectInlineConfiguration } from 'vitest/config';
import type { ProjectOptions } from '../interfaces/project-options.interface.ts';

export function createTypescriptJsdomProject(options: ProjectOptions): TestProjectInlineConfiguration {
  return {
    test: {
      name: options.name,
      environment: 'jsdom',
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
    },
  };
}
