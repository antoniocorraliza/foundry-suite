import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SPEC_TSCONFIG } from '../constants/paths.constant.ts';
import type { ProjectOptions } from '../interfaces/project-options.interface.ts';

// Type tests only run the compiler, so one project is enough for every time zone.
export function createTypescriptTypesProject(options: ProjectOptions): TestProjectInlineConfiguration {
  return {
    test: {
      name: options.name,
      include: [],
      typecheck: {
        enabled: true,
        only: true,
        include: [...options.include],
        exclude: [...(options.exclude ?? [])],
        tsconfig: SPEC_TSCONFIG,
      },
    },
  };
}
