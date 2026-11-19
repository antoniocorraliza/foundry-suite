import { ASSISTANT_ATTRIBUTION } from '../constants/commit-rules.constant.ts';
import { titleProblems } from './title-problems.function.ts';

export function messageProblems(message: string): Array<string> {
  const [title = '', lineAfterTitle]: Array<string> = message.trimEnd().split('\n');
  const problems: Array<string> = titleProblems(title);
  if (lineAfterTitle !== undefined && lineAfterTitle !== '') problems.push('the body must be separated from the title by a blank line');
  if (ASSISTANT_ATTRIBUTION.test(message)) problems.push('the message credits a tool or an assistant');
  return problems;
}
