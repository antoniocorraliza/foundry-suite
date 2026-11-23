export const COMMIT_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'] as const;
export const COMMIT_SCOPES = ['workspace', 'packages', 'ci', 'utils', 'core', 'ui', 'deps'] as const;
export const COMMIT_TITLE: RegExp = new RegExp(
  `^(?:${COMMIT_TYPES.join('|')})(?:\\((?:${COMMIT_SCOPES.join('|')})\\))?!?: [a-z0-9\`"'(].*[^.\\s]$`,
);
export const MAXIMUM_TITLE_LENGTH: number = 72;
export const ATTRIBUTION_LINE: RegExp = /^co-authored-by:|^[\w-]+-session:|generated with/im;
