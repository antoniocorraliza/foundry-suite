export const CHECKED_FILE: RegExp = /\.(?:ts|mjs|js|json|ya?ml|md|html|css|scss)$/;
export const LOCKFILE: RegExp = /(?:^|\/)package-lock\.json$/;
export const MARKDOWN_FILE: RegExp = /\.md$/;
export const SPEC_FILE: RegExp = /\.spec\.ts$/;
export const TYPESCRIPT_FILE: RegExp = /\.ts$/;
export const SKIPPED_FILES: ReadonlySet<string> = new Set([
  'CONTRIBUTING.md',
  'tools/lint/constants/text-rules.constant.ts',
  'tools/lint/functions/has-review-code.function.spec.ts',
  'tools/lint/functions/test-title-problems.function.spec.ts',
  'tools/lint/functions/text-problems.function.spec.ts',
]);
