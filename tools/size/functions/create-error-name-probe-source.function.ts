import { ANGULAR_PACKAGES } from '../constants/size-settings.constant.ts';
import type { PublicErrorClass } from '../interfaces/public-error-class.interface.ts';

export function createErrorNameProbeSource(specifier: string, errorClass: PublicErrorClass): string {
  return [
    // The probe runs on Node without the Angular linker: partially compiled Angular code needs the JIT compiler to load.
    ...(ANGULAR_PACKAGES.includes(errorClass.packageFolder) ? ["import '@angular/compiler';"] : []),
    `import { ${errorClass.className} as ProbeError } from '${specifier}';`,
    `console.log(new ProbeError(${errorClass.constructorArguments}).name);`,
    '',
  ].join('\n');
}
