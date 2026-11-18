/* Values that the shared project factories pass to the tests with `provide` (read them with `inject` from 'vitest'). */
import 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    /** Angular Node projects: which change detection the TestBed uses. */
    changeDetection: 'zone' | 'zoneless';
    /** Time zone projects: the zone the test must run in. */
    expectedTimeZone: string;
  }
}
