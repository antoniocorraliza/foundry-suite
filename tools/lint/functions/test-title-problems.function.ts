import ts from 'typescript';
import { hasReviewCode } from './has-review-code.function.ts';
import { testTitleArgument } from './test-title-argument.function.ts';

function testTitleText(argument: ts.Expression | null): string | null {
  if (argument === null) return null;
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text;
  if (ts.isTemplateExpression(argument)) return argument.head.text + argument.templateSpans.map((span) => span.literal.text).join(' ');
  return null;
}

export function testTitleProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    const title: string | null = testTitleText(testTitleArgument(node));
    if (title !== null && hasReviewCode(title)) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
      problems.push(`${path}:${line + 1}: review code in a test title: ${title.slice(0, 100)}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
