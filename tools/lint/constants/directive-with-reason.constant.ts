// The reason goes in the directive itself: after `--` for ESLint, after the code for TypeScript.
export const DIRECTIVE_WITH_REASON: RegExp = /^\/\/ (?:eslint-disable-next-line \S.*? -- \S|@ts-expect-error \S)/;
