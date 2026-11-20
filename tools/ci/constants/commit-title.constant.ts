import { COMMIT_SCOPES } from './commit-scopes.constant.ts';
import { COMMIT_TYPES } from './commit-types.constant.ts';

export const COMMIT_TITLE: RegExp = new RegExp(
  `^(?:${COMMIT_TYPES.join('|')})(?:\\((?:${COMMIT_SCOPES.join('|')})\\))?!?: [a-z0-9\`"'(].*[^.\\s]$`,
);
