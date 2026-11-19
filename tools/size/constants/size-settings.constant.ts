import type { SizeTool } from '../types/size-tool.type.ts';

export const SIZE_REFERENCE_PATH: string = 'tools/size/size-reference.json';
export const BYTES_PER_KILOBYTE: number = 1000;
export const GZIP_LEVEL: number = 6;
export const NOT_MEASURED_ENTRIES: ReadonlyArray<string> = ['testing'];
export const GZIP_BUDGET_TOOLS: ReadonlyArray<SizeTool> = ['angular', 'esbuild', 'files'];
export const EXTERNAL_PACKAGE: RegExp = /^(?:@angular\/|rxjs(?:\/|$))/;
export const FOUNDRY_SPECIFIER: RegExp = /^@antoniocorraliza\/foundry-(?:core|ui|utils)(?:\/|$)/;
