import { SPEC_FILE } from '../constants/spec-file.constant.ts';
import { TEXT_RULES } from '../constants/text-rules.constant.ts';
import type { TextRule } from '../interfaces/text-rule.interface.ts';
import { hasReviewCode } from './has-review-code.function.ts';
import { maskTestData } from './mask-test-data.function.ts';

export function findTextProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const rules: Array<TextRule> = TEXT_RULES.filter((rule) => !rule.onlyIn || rule.onlyIn.test(path));
  const linesWithoutTestData: Array<string> = (SPEC_FILE.test(path) ? maskTestData(path, text) : text).split('\n');
  text.split('\n').forEach((line, index) => {
    rules.forEach((rule) => {
      const checkedLine: string = rule.isAllowedInTestData ? (linesWithoutTestData[index] ?? line) : line;
      if (rule.pattern.test(checkedLine)) problems.push(`${path}:${index + 1}: ${rule.name}: ${line.trim().slice(0, 100)}`);
    });
    if (hasReviewCode(line)) problems.push(`${path}:${index + 1}: review code: ${line.trim().slice(0, 100)}`);
  });
  return problems;
}
