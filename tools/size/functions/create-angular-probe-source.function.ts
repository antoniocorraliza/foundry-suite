import type { BaseComponent } from '../interfaces/base-component.interface.ts';
import type { ResolvedImport } from '../interfaces/resolved-import.interface.ts';
import { createProbeSource } from './create-probe-source.function.ts';

export function createAngularProbeSource(baseComponent: BaseComponent, imports: ReadonlyArray<ResolvedImport>): string {
  return [
    "import { provideHttpClient, withFetch } from '@angular/common/http';",
    "import { bootstrapApplication } from '@angular/platform-browser';",
    "import { provideRouter } from '@angular/router';",
    `import { ${baseComponent.className} } from '${baseComponent.path}';`,
    createProbeSource(imports).trimEnd(),
    `bootstrapApplication(${baseComponent.className}, { providers: [provideRouter([]), provideHttpClient(withFetch())] }).catch((error) => console.error(error));`,
    '',
  ].join('\n');
}
