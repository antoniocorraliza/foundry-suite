import ts from 'typescript';
import { TEST_FUNCTIONS } from '../constants/test-titles.constant.ts';

function getTestFunctionName(expression: ts.Expression): string | null {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return getTestFunctionName(expression.expression);
  if (ts.isCallExpression(expression)) return getTestFunctionName(expression.expression);
  return null;
}

export function getTestTitleArgument(node: ts.Node): ts.Expression | null {
  if (!ts.isCallExpression(node)) return null;
  const name: string | null = getTestFunctionName(node.expression);
  return name !== null && TEST_FUNCTIONS.has(name) ? (node.arguments[0] ?? null) : null;
}
