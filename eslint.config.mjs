// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const MESSAGE_FORMAT = String.raw`/^\[[a-z0-9-]+\]: [^A-Z].*[^.]$/`;
const MESSAGE_PREFIX = String.raw`/^\[[a-z0-9-]+\]: /`;
const MESSAGE_RULE = 'Messages read "[who]: lowercase sentence without a final period" (CONTRIBUTING.md).';
const MESSAGE_CALLS = [
  'NewExpression[callee.name=/Error$/]',
  "CallExpression[callee.object.name='console'][callee.property.name=/^(?:error|warn)$/]",
];
const MESSAGE_SELECTORS = [
  ...MESSAGE_CALLS.map((call) => ({ selector: `${call} > Literal:first-child[value!=${MESSAGE_FORMAT}]`, message: MESSAGE_RULE })),
  ...MESSAGE_CALLS.map((call) => ({
    selector: `${call} > TemplateLiteral:first-child > TemplateElement:first-child[value.cooked!=${MESSAGE_PREFIX}]`,
    message: MESSAGE_RULE,
  })),
];

// no-restricted-syntax takes the last matching block whole, so every block below repeats the message selectors.
const TOP_LEVEL = ['Program > ', 'Program > ExportNamedDeclaration > '];
const TOKEN_CLASSES = '/^(?:InjectionToken|HttpContextToken)$/';
const EXEMPT_FILES = ['**/*.spec.ts', '**/*.d.ts'];
const forbid = (selectors, message) => selectors.map((selector) => ({ selector, message }));
const NAMED_OBJECT_TYPES = forbid(['TSTypeLiteral'], 'Object types get a name: declare an interface in interfaces/.');
const CODE_FILE_SELECTORS = [
  ...forbid(['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'], 'Interfaces and types go in interfaces/.'),
  ...forbid(
    TOP_LEVEL.map(
      (prefix) => `${prefix}VariableDeclaration > VariableDeclarator[init.type!=/^(?:ArrowFunctionExpression|FunctionExpression)$/]`,
    ),
    'Top-level values go in constants/ or tokens/; module state goes inside a function.',
  ),
];
const INTERFACE_FILE_SELECTORS = forbid(
  TOP_LEVEL.flatMap((prefix) => [
    `${prefix}FunctionDeclaration`,
    `${prefix}VariableDeclaration`,
    `${prefix}ClassDeclaration`,
    `${prefix}TSEnumDeclaration`,
  ]),
  'Files in interfaces/ only declare interfaces and types.',
);
const CONSTANT_FILE_SELECTORS = [
  ...forbid(
    TOP_LEVEL.map(
      (prefix) =>
        `${prefix}VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]):not([init.type='TSAsExpression'][init.typeAnnotation.typeName.name='const'])`,
    ),
    'Constants declare their type, or end in `as const` when they are a closed list.',
  ),
  ...forbid(
    TOP_LEVEL.flatMap((prefix) => [
      `${prefix}FunctionDeclaration`,
      `${prefix}ClassDeclaration`,
      `${prefix}TSInterfaceDeclaration`,
      `${prefix}TSTypeAliasDeclaration`,
    ]),
    'Files in constants/ only declare constants and enums.',
  ),
  ...forbid([`NewExpression[callee.name=${TOKEN_CLASSES}]`], 'Angular tokens go in tokens/.'),
];
const TYPEDEF_OPTIONS = {
  variableDeclaration: true,
  variableDeclarationIgnoreFunction: true,
  memberVariableDeclaration: true,
  parameter: true,
  propertyDeclaration: true,
  arrowParameter: false,
  arrayDestructuring: false,
  objectDestructuring: false,
};
const TOKEN_FILE_SELECTORS = forbid(
  TOP_LEVEL.flatMap((prefix) => [
    `${prefix}FunctionDeclaration`,
    `${prefix}ClassDeclaration`,
    `${prefix}TSInterfaceDeclaration`,
    `${prefix}TSTypeAliasDeclaration`,
    `${prefix}TSEnumDeclaration`,
    `${prefix}VariableDeclaration > VariableDeclarator[init.callee.name!=${TOKEN_CLASSES}]`,
  ]),
  'Files in tokens/ only declare Angular tokens.',
);

export default defineConfig([
  globalIgnores(['dist/', 'out-tsc/', 'coverage/', '.angular/']),
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic, angular.configs.tsRecommended],
    plugins: { 'simple-import-sort': simpleImportSort },
    processor: angular.processInlineTemplates,
    rules: {
      curly: ['error', 'multi-line'],
      'id-length': ['error', { min: 2, properties: 'never', exceptionPatterns: ['^[A-Z]$'] }],
      'id-denylist': [
        'error',
        'acc',
        'arr',
        'cb',
        'el',
        'err',
        'evt',
        'fn',
        'idx',
        'msg',
        'num',
        'obj',
        'opts',
        'res',
        'str',
        'tmp',
        'val',
      ],
      'no-restricted-syntax': ['error', ...MESSAGE_SELECTORS, ...NAMED_OBJECT_TYPES, ...CODE_FILE_SELECTORS],
      '@typescript-eslint/consistent-type-imports': 'error',
      // One inner list: the groups keep their order but are not separated by blank lines.
      'simple-import-sort/imports': ['error', { groups: [['^\\u0000', '^node:', '^@?\\w', '^@antoniocorraliza(?:/|$)', '^\\.']] }],
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-generic-constructors': ['error', 'type-annotation'],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      // Types are written out even when they could be inferred.
      '@typescript-eslint/no-inferrable-types': 'off',
      // Deprecated in typescript-eslint 8.33 but still working, and nothing else requires annotations on variables.
      '@typescript-eslint/typedef': ['error', TYPEDEF_OPTIONS],
    },
  },
  {
    files: ['**/interfaces/**/*.ts'],
    ignores: EXEMPT_FILES,
    rules: { 'no-restricted-syntax': ['error', ...MESSAGE_SELECTORS, ...NAMED_OBJECT_TYPES, ...INTERFACE_FILE_SELECTORS] },
  },
  {
    files: ['**/constants/**/*.ts'],
    ignores: EXEMPT_FILES,
    rules: {
      // A closed list is `as const`, and its type is derived from it in interfaces/.
      '@typescript-eslint/typedef': ['error', { ...TYPEDEF_OPTIONS, variableDeclaration: false }],
      'no-restricted-syntax': ['error', ...MESSAGE_SELECTORS, ...NAMED_OBJECT_TYPES, ...CONSTANT_FILE_SELECTORS],
    },
  },
  {
    files: ['**/tokens/**/*.ts'],
    ignores: EXEMPT_FILES,
    rules: { 'no-restricted-syntax': ['error', ...MESSAGE_SELECTORS, ...NAMED_OBJECT_TYPES, ...TOKEN_FILE_SELECTORS] },
  },
  {
    files: EXEMPT_FILES,
    rules: { 'no-restricted-syntax': ['error', ...MESSAGE_SELECTORS] },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
]);
