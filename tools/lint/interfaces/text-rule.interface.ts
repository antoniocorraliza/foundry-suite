export interface TextRule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly onlyIn?: RegExp;
}
