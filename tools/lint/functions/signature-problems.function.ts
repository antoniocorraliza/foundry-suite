import ts from 'typescript';
import type { ArrowFunctionDeclaration } from '../interfaces/arrow-function-declaration.interface.ts';

function signatureSplitAcrossLines(source: ts.SourceFile, node: ts.Node): ts.Node | undefined {
  const isFunction: boolean =
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node);
  const isArrowConstant: boolean = ts.isVariableDeclaration(node) && node.initializer !== undefined && ts.isArrowFunction(node.initializer);
  if (!isFunction && !isArrowConstant) return undefined;
  const start: ts.Node = isArrowConstant ? node : ((node as ts.SignatureDeclaration).name ?? node);
  const end: ts.Node | undefined = isArrowConstant
    ? (node as ArrowFunctionDeclaration).initializer.equalsGreaterThanToken
    : (node as ts.FunctionLikeDeclaration).body;
  if (end === undefined) return undefined;
  const startLine: number = source.getLineAndCharacterOfPosition(start.getStart(source)).line;
  const endLine: number = source.getLineAndCharacterOfPosition(end.getStart(source)).line;
  return endLine > startLine ? start : undefined;
}

export function signatureProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    const signature: ts.Node | undefined = signatureSplitAcrossLines(source, node);
    if (signature !== undefined) {
      const { line } = source.getLineAndCharacterOfPosition(signature.getStart(source));
      problems.push(`${path}:${line + 1}: signature on several lines: extract a named type for the parameters`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
