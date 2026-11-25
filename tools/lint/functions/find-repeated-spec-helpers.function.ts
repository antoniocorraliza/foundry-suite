import ts from 'typescript';

function isHelperDeclaration(statement: ts.Statement): statement is ts.FunctionDeclaration | ts.TypeAliasDeclaration {
  return ts.isFunctionDeclaration(statement) || ts.isTypeAliasDeclaration(statement);
}

function listTopLevelHelpers(path: string, text: string): Array<[string, number]> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  return source.statements
    .filter(isHelperDeclaration)
    .filter((statement) => statement.name !== undefined)
    .map((statement) => [statement.name?.text ?? '', source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1]);
}

export function findRepeatedSpecHelpers(specTexts: ReadonlyMap<string, string>): Array<string> {
  const firstFiles: Map<string, string> = new Map<string, string>();
  return [...specTexts].flatMap(([path, text]) =>
    listTopLevelHelpers(path, text).flatMap(([name, line]) => {
      const firstFile: string | undefined = firstFiles.get(name);
      if (firstFile === undefined) {
        firstFiles.set(name, path);
        return [];
      }
      return [`${path}:${line}: repeated test helper: ${name} is also declared in ${firstFile}; move it to a shared file`];
    }),
  );
}
