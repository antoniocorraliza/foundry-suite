// Each folder of a piece holds one kind of file, recognised by its suffix. Tests sit next to the file they test.
export const FOLDER_SUFFIXES: Readonly<Record<string, ReadonlyArray<string>>> = {
  components: ['.component.ts', '.component.html', '.component.scss', '.component.css'],
  constants: ['.constant.ts', '.enum.ts'],
  directives: ['.directive.ts'],
  functions: ['.function.ts'],
  guards: ['.guard.ts'],
  interceptors: ['.interceptor.ts'],
  interfaces: ['.interface.ts', '.type.ts'],
  pipes: ['.pipe.ts'],
  providers: ['.provider.ts'],
  resolvers: ['.resolver.ts'],
  services: ['.service.ts'],
  tokens: ['.token.ts'],
};
