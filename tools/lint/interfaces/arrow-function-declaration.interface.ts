import type ts from 'typescript';

export interface ArrowFunctionDeclaration extends ts.VariableDeclaration {
  readonly initializer: ts.ArrowFunction;
}
