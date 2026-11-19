import 'vitest';

// Values that the project factories pass to the tests with `provide`; read them with `inject` from 'vitest'.
declare module 'vitest' {
  export interface ProvidedContext {
    changeDetection: 'zone' | 'zoneless';
    expectedTimeZone: string;
    expectedAngularMajor: number;
  }
}
