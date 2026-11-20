import ts from 'typescript';

function isExported(statement: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(statement) && (ts.getModifiers(statement) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
  );
}

function readStatementNames(statement: ts.Statement): Array<string> {
  if (ts.isExportDeclaration(statement)) {
    const clause: ts.NamedExportBindings | undefined = statement.exportClause;
    return clause !== undefined && ts.isNamedExports(clause) ? clause.elements.map((element) => element.name.text) : ['*'];
  }
  if (ts.isExportAssignment(statement)) return ['default'];
  if (!isExported(statement)) return [];
  if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.map((declaration) => declaration.name.getText());
  const name: ts.DeclarationName | undefined = (statement as ts.DeclarationStatement).name;
  return [name === undefined ? 'default' : name.getText()];
}

export function listExportedNames(source: ts.SourceFile): Array<string> {
  return [...new Set(source.statements.flatMap((statement) => readStatementNames(statement)))];
}
