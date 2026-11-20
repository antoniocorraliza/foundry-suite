import type { TestProjectInlineConfiguration } from 'vitest/config';
import type { TypescriptNodeProjectOptions } from '../interfaces/typescript-node-project-options.interface.ts';
import { getTimeZoneSlug } from './get-time-zone-slug.function.ts';

// TZ is only read when the process starts, so each time zone gets its own forked process.
export function createTypescriptNodeProjects(options: TypescriptNodeProjectOptions): Array<TestProjectInlineConfiguration> {
  return options.timeZones.map((timeZone) => ({
    test: {
      name: `${options.name}:${getTimeZoneSlug(timeZone)}`,
      environment: 'node',
      pool: 'forks',
      env: { TZ: timeZone },
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      provide: { expectedTimeZone: timeZone },
    },
  }));
}
