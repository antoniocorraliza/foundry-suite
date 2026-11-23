import { ATTRIBUTION_LINE } from '../constants/commit-rules.constant.ts';
import { findTitleProblems } from './find-title-problems.function.ts';

export function findMessageProblems(message: string): Array<string> {
  const [title = '', lineAfterTitle]: Array<string> = message.trimEnd().split('\n');
  const problems: Array<string> = findTitleProblems(title);
  if (lineAfterTitle !== undefined && lineAfterTitle !== '') problems.push('the body must be separated from the title by a blank line');
  if (ATTRIBUTION_LINE.test(message)) problems.push('the message credits a tool or an assistant');
  return problems;
}
