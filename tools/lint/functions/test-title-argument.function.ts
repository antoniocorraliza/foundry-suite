import ts from 'typescript';
import { TEST_FUNCTIONS } from '../constants/test-titles.constant.ts';

function testFunctionName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return testFunctionName(expression.expression);
  if (ts.isCallExpression(expression)) return testFunctionName(expression.expression);
  return undefined;
}

export function testTitleArgument(node: ts.Node): ts.Expression | undefined {
  if (!ts.isCallExpression(node)) return undefined;
  const name: string | undefined = testFunctionName(node.expression);
  return name !== undefined && TEST_FUNCTIONS.has(name) ? node.arguments[0] : undefined;
}
