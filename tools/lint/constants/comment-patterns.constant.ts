// The reason goes in the directive itself: after `--` for ESLint, after the code for TypeScript.
export const DIRECTIVE_WITH_REASON: RegExp = /^\/\/ (?:eslint-disable-next-line \S.*? -- \S|@ts-expect-error \S)/;
export const PURE_ANNOTATION: RegExp = /^\/\*\s*[@#]__PURE__\s*\*\/$/;
export const SECTION_MARKERS = [
  'INJECTORS',
  'DATA BINDING',
  'CONTROL VARIABLES',
  'LIFECYCLE HOOKS',
  'ACTIONS',
  'HANDLERS',
  'GETTERS & SETTERS',
  'VALIDATIONS',
  'AUXILIARY FUNCTIONS',
] as const;
