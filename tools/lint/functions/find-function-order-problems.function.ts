import ts from 'typescript';

function isExported(statement: ts.FunctionDeclaration): boolean {
  return statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

export function findFunctionOrderProblems(path: string, text: string): Array<string> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const functions: Array<ts.FunctionDeclaration> = source.statements.filter(ts.isFunctionDeclaration);
  const firstExportedIndex: number = functions.findIndex(isExported);
  if (firstExportedIndex === -1) return [];
  return functions
    .slice(firstExportedIndex)
    .filter((statement) => !isExported(statement))
    .map((statement) => {
      const { line } = source.getLineAndCharacterOfPosition(statement.getStart(source));
      return `${path}:${line + 1}: function order: ${statement.name?.text ?? 'function'} is private, so it goes before the exported function`;
    });
}
