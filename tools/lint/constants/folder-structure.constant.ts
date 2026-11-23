export const FOLDER_SUFFIXES: Readonly<Record<string, ReadonlyArray<string>>> = {
  components: ['.component.ts', '.component.html', '.component.scss', '.component.css'],
  constants: ['.constant.ts', '.enum.ts'],
  directives: ['.directive.ts'],
  errors: ['.error.ts'],
  functions: ['.function.ts'],
  guards: ['.guard.ts'],
  interceptors: ['.interceptor.ts'],
  interfaces: ['.interface.ts'],
  pipes: ['.pipe.ts'],
  providers: ['.provider.ts'],
  resolvers: ['.resolver.ts'],
  services: ['.service.ts'],
  tokens: ['.token.ts'],
  types: ['.type.ts'],
};
export const FOLDER_NAME_SUFFIXES: Readonly<Record<string, string>> = {
  components: 'Component',
  directives: 'Directive',
  errors: 'Error',
  guards: 'Guard',
  interceptors: 'Interceptor',
  pipes: 'Pipe',
  resolvers: 'Resolver',
  services: 'Service',
};
export const CLASS_DECORATOR: RegExp = /^@(Component|Directive|Injectable|Pipe)\(/gm;
export const DECORATOR_SUFFIXES: Readonly<Record<string, string>> = {
  Component: '.component.ts',
  Directive: '.directive.ts',
  Injectable: '.service.ts',
  Pipe: '.pipe.ts',
};
