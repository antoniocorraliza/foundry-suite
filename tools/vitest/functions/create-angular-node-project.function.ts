import type { TestProjectInlineConfiguration } from 'vitest/config';
import { ANGULAR_OPTIMIZED_DEPENDENCIES } from '../constants/angular-optimized-dependencies.constant.ts';
import { SETUP_DIRECTORY } from '../constants/test-paths.constant.ts';
import type { AngularNodeProjectOptions } from '../interfaces/angular-node-project-options.interface.ts';
import { createAngularPlugin } from './create-angular-plugin.function.ts';

// The zone.js setup patches the global describe and it, so Angular projects need `globals: true`.
export function createAngularNodeProject(options: AngularNodeProjectOptions): TestProjectInlineConfiguration {
  return {
    plugins: [createAngularPlugin()],
    optimizeDeps: { include: [...ANGULAR_OPTIMIZED_DEPENDENCIES] },
    test: {
      name: options.name,
      environment: 'jsdom',
      globals: true,
      setupFiles: [`${SETUP_DIRECTORY}/angular-${options.changeDetection}.ts`],
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      provide: { changeDetection: options.changeDetection, expectedAngularMajor: options.environment.expectedAngularMajor },
    },
  };
}
