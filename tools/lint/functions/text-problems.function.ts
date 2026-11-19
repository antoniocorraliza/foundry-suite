import { TEXT_RULES } from '../constants/text-rules.constant.ts';
import type { TextRule } from '../interfaces/text-rule.interface.ts';
import { hasReviewCode } from './has-review-code.function.ts';

export function textProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const rules: Array<TextRule> = TEXT_RULES.filter((rule) => !rule.onlyIn || rule.onlyIn.test(path));
  text.split('\n').forEach((line, index) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) problems.push(`${path}:${index + 1}: ${rule.name}: ${line.trim().slice(0, 100)}`);
    }
    if (hasReviewCode(line)) problems.push(`${path}:${index + 1}: review code: ${line.trim().slice(0, 100)}`);
  });
  return problems;
}
