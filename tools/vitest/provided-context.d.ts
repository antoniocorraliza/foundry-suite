import 'vitest';
import type { ChangeDetection } from './types/change-detection.type.ts';

declare module 'vitest' {
  export interface ProvidedContext {
    changeDetection: ChangeDetection;
    expectedTimeZone: string;
    expectedAngularMajor: number;
  }
}
