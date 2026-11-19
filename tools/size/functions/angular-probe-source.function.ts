import type { BaseComponent } from '../interfaces/base-component.interface.ts';
import type { ResolvedImport } from '../interfaces/resolved-import.interface.ts';
import { probeSource } from './probe-source.function.ts';

export function angularProbeSource(baseComponent: BaseComponent, imports: ReadonlyArray<ResolvedImport>): string {
  return [
    "import { provideHttpClient, withFetch } from '@angular/common/http';",
    "import { bootstrapApplication } from '@angular/platform-browser';",
    "import { provideRouter } from '@angular/router';",
    `import { ${baseComponent.className} } from '${baseComponent.path}';`,
    probeSource(imports).trimEnd(),
    `bootstrapApplication(${baseComponent.className}, { providers: [provideRouter([]), provideHttpClient(withFetch())] }).catch((error) => console.error(error));`,
    '',
  ].join('\n');
}
