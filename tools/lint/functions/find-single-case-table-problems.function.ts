import ts from 'typescript';
import { TEST_FUNCTIONS } from '../constants/test-functions.constant.ts';

function getTableCallee(node: ts.CallExpression): ts.PropertyAccessExpression | null {
  if (!ts.isCallExpression(node.expression)) return null;
  const callee: ts.Expression = node.expression.expression;
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'each') return null;
  let base: ts.Expression = callee.expression;
  while (ts.isPropertyAccessExpression(base)) base = base.expression;
  return ts.isIdentifier(base) && TEST_FUNCTIONS.has(base.text) ? callee : null;
}

function findArrayInitializer(source: ts.SourceFile, name: string): ts.ArrayLiteralExpression | null {
  let found: ts.ArrayLiteralExpression | null = null;
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer !== undefined) {
      const initializer: ts.Expression = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (ts.isArrayLiteralExpression(initializer)) found = initializer;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function getTableRowCount(source: ts.SourceFile, table: ts.Expression | undefined): number | null {
  if (table === undefined) return null;
  const array: ts.ArrayLiteralExpression | null = ts.isIdentifier(table)
    ? findArrayInitializer(source, table.text)
    : ts.isArrayLiteralExpression(table)
      ? table
      : null;
  if (array === null || array.elements.some(ts.isSpreadElement)) return null;
  return array.elements.length;
}

export function findSingleCaseTableProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && getTableCallee(node) !== null && ts.isCallExpression(node.expression)) {
      const rows: number | null = getTableRowCount(source, node.expression.arguments[0]);
      if (rows !== null && rows < 2) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push(`${path}:${line + 1}: test table with ${rows} case(s): write it as a test without each`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
