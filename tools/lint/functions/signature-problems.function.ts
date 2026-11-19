import ts from 'typescript';
import { LIBRARY_TYPESCRIPT_FILE, SPEC_FILE } from '../constants/file-patterns.constant.ts';
import type { ArrowFunctionDeclaration } from '../interfaces/arrow-function-declaration.interface.ts';

function isExported(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function isPrivateMember(node: ts.ClassElement): boolean {
  if (node.name !== undefined && ts.isPrivateIdentifier(node.name)) return true;
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword);
}

function isPublicApiSignature(node: ts.Node): boolean {
  if (ts.isFunctionDeclaration(node)) return ts.isSourceFile(node.parent) && isExported(node);
  if (ts.isVariableDeclaration(node)) {
    const statement: ts.Node = node.parent.parent;
    return ts.isVariableStatement(statement) && ts.isSourceFile(statement.parent) && isExported(statement);
  }
  const owner: ts.Node = node.parent;
  return (
    ts.isClassElement(node) && ts.isClassDeclaration(owner) && ts.isSourceFile(owner.parent) && isExported(owner) && !isPrivateMember(node)
  );
}

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
  const isLibraryCode: boolean = LIBRARY_TYPESCRIPT_FILE.test(path) && !SPEC_FILE.test(path);
  const visit = (node: ts.Node): void => {
    const signature: ts.Node | undefined = signatureSplitAcrossLines(source, node);
    if (signature !== undefined && !(isLibraryCode && isPublicApiSignature(node))) {
      const { line } = source.getLineAndCharacterOfPosition(signature.getStart(source));
      problems.push(`${path}:${line + 1}: signature on several lines: extract a named type for the parameters`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
