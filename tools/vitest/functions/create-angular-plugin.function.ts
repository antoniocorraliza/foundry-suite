import angular from '@analogjs/vite-plugin-angular';
import type { Plugin } from 'vitest/config';
import { SPEC_TSCONFIG } from '../constants/paths.constant.ts';

export function createAngularPlugin(): Array<Plugin> {
  return angular({ tsconfig: SPEC_TSCONFIG });
}
