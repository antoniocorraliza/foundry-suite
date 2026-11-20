import { COMMIT_SCOPES } from '../constants/commit-scopes.constant.ts';
import { COMMIT_TITLE } from '../constants/commit-title.constant.ts';
import { MAXIMUM_TITLE_LENGTH } from '../constants/maximum-title-length.constant.ts';

export function findTitleProblems(title: string): Array<string> {
  const problems: Array<string> = [];
  if (title.length > MAXIMUM_TITLE_LENGTH) {
    problems.push(`title is ${title.length} characters long, the maximum is ${MAXIMUM_TITLE_LENGTH}`);
  }
  if (!COMMIT_TITLE.test(title)) {
    problems.push(`title must be "type(scope): lowercase description" without a final period; scopes: ${COMMIT_SCOPES.join(', ')}`);
  }
  return problems;
}
