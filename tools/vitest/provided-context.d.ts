import 'vitest';
import type { ChangeDetection } from './types/change-detection.type.ts';

// Read them with `inject` from 'vitest', not the one from Angular.
declare module 'vitest' {
  export interface ProvidedContext {
    changeDetection: ChangeDetection;
    expectedTimeZone: string;
    expectedAngularMajor: number;
  }
}
