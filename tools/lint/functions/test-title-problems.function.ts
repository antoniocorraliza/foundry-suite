import ts from 'typescript';
import { TEST_FUNCTIONS } from '../constants/test-titles.constant.ts';
import { hasReviewCode } from './has-review-code.function.ts';

function testFunctionName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return testFunctionName(expression.expression);
  if (ts.isCallExpression(expression)) return testFunctionName(expression.expression);
  return undefined;
}

function testTitleText(argument: ts.Expression | undefined): string | undefined {
  if (argument === undefined) return undefined;
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text;
  if (ts.isTemplateExpression(argument)) return argument.head.text + argument.templateSpans.map((span) => span.literal.text).join(' ');
  return undefined;
}

export function testTitleProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const name: string | undefined = testFunctionName(node.expression);
      const title: string | undefined = name && TEST_FUNCTIONS.has(name) ? testTitleText(node.arguments[0]) : undefined;
      if (title !== undefined && hasReviewCode(title)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push(`${path}:${line + 1}: review code in a test title: ${title.slice(0, 100)}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
