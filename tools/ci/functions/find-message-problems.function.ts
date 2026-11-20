import { ASSISTANT_ATTRIBUTION } from '../constants/assistant-attribution.constant.ts';
import { findTitleProblems } from './find-title-problems.function.ts';

export function findMessageProblems(message: string): Array<string> {
  const [title = '', lineAfterTitle]: Array<string> = message.trimEnd().split('\n');
  const problems: Array<string> = findTitleProblems(title);
  if (lineAfterTitle !== undefined && lineAfterTitle !== '') problems.push('the body must be separated from the title by a blank line');
  if (ASSISTANT_ATTRIBUTION.test(message)) problems.push('the message credits a tool or an assistant');
  return problems;
}
