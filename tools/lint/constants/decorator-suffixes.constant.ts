export const DECORATOR_SUFFIXES: Readonly<Record<string, string>> = {
  Component: '.component.ts',
  Directive: '.directive.ts',
  Injectable: '.service.ts',
  Pipe: '.pipe.ts',
};
export const CLASS_DECORATOR: RegExp = /^@(Component|Directive|Injectable|Pipe)\(/gm;
