export const COMMIT_TYPES: ReadonlyArray<string> = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];
export const COMMIT_SCOPES: ReadonlyArray<string> = ['workspace', 'packages', 'ci', 'utils', 'core', 'ui', 'deps'];
export const MAXIMUM_TITLE_LENGTH: number = 72;
export const COMMIT_TITLE: RegExp = new RegExp(
  `^(?:${COMMIT_TYPES.join('|')})(?:\\((?:${COMMIT_SCOPES.join('|')})\\))?!?: [a-z0-9\`"'(].*[^.\\s]$`,
);
export const ASSISTANT_ATTRIBUTION: RegExp = /^co-authored-by:|generated with|claude-session:|noreply@anthropic\.com/im;
