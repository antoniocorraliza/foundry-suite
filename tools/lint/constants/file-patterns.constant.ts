export const CHECKED_FILE: RegExp = /\.(?:ts|mjs|js|json|ya?ml|md|html|css|scss)$/;
export const LOCKFILE: RegExp = /(?:^|\/)package-lock\.json$/;
export const MARKDOWN_FILE: RegExp = /\.md$/;
export const SPEC_FILE: RegExp = /\.spec\.ts$/;
export const TYPESCRIPT_FILE: RegExp = /\.ts$/;
export const LIBRARY_TYPESCRIPT_FILE: RegExp = /^projects\/.*\.ts$/;
export const LIBRARY_CODE_FILE: RegExp = /^projects\/(?!.*\.spec\.ts$).*\.ts$/;
export const LIBRARY_TEMPLATE_FILE: RegExp = /^projects\/.*\.html$/;
export const LIBRARY_STYLE_FILE: RegExp = /^projects\/.*\.s?css$/;
// The global style sheets of UI are public: their classes are the ones its design fixes.
export const LIBRARY_COMPONENT_STYLE_FILE: RegExp = /^projects\/(?![^/]+\/[^/]+\/styles\/).*\.s?css$/;
export const SKIPPED_FILES: ReadonlySet<string> = new Set([
  'CONTRIBUTING.md',
  'tools/lint/constants/text-rules.constant.ts',
  'tools/lint/functions/has-review-code.function.spec.ts',
  'tools/lint/functions/test-title-problems.function.spec.ts',
  'tools/lint/functions/text-problems.function.spec.ts',
]);
