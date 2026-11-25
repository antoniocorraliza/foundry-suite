// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

function forbid(selectors, message) {
  return selectors.map((selector) => ({ selector, message }));
}

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

const LIFECYCLE_HOOK = '/^ng(?:OnInit|OnChanges|DoCheck|AfterContentInit|AfterContentChecked|AfterViewInit|AfterViewChecked|OnDestroy)$/';
const OWN_METHOD_CALL = "ExpressionStatement[expression.type='CallExpression'][expression.callee.object.type='ThisExpression']";
const LIFECYCLE_HOOK_SELECTORS = [
  {
    selector: `MethodDefinition[key.name=${LIFECYCLE_HOOK}] > FunctionExpression > BlockStatement > :not(${OWN_METHOD_CALL})`,
    message: 'Lifecycle hooks only call methods of the class: move the code to a named method.',
  },
];
const TOP_LEVEL = ['Program > ', 'Program > ExportNamedDeclaration > '];
const FUNCTION_VALUE_TYPES = '/^(?:ArrowFunctionExpression|FunctionExpression)$/';
// Functional interceptors, guards and resolvers keep the constant with the type that Angular expects (HttpInterceptorFn...).
const FUNCTION_VALUE = `[init.type=${FUNCTION_VALUE_TYPES}]:not([id.typeAnnotation.typeAnnotation.typeName.name=/Fn$/])`;
const CODE_SHAPE_SELECTORS = [
  ...TOP_LEVEL.map((prefix) => ({
    selector: `${prefix}VariableDeclaration > VariableDeclarator${FUNCTION_VALUE}`,
    message: 'Top-level functions are declared with `function`, not as constants.',
  })),
  { selector: 'PrivateIdentifier', message: 'Private members use the TypeScript `private` modifier, not `#`.' },
  // A return or break inside a nested callback also lets a loop through. A for loop with an index is left to the review.
  ...['ForOfStatement[await=false]', 'ForInStatement'].map((loop) => ({
    selector: `${loop}:not(:has(AwaitExpression, BreakStatement, ReturnStatement, YieldExpression))`,
    message: 'Lists are walked with array methods (forEach, map, filter, reduce...): a loop only to await inside it or to stop early.',
  })),
];
// Every function starts with a verb of this list; add one here when a new name needs it.
const FUNCTION_VERBS = [
  'add',
  'apply',
  'are',
  'build',
  'bundle',
  'can',
  'cancel',
  'capitalize',
  'catch',
  'check',
  'clamp',
  'clean',
  'clear',
  'clone',
  'close',
  'collect',
  'compare',
  'compile',
  'convert',
  'copy',
  'create',
  'decode',
  'define',
  'describe',
  'dismiss',
  'dispose',
  'download',
  'emit',
  'enter',
  'escape',
  'filter',
  'find',
  'flush',
  'forbid',
  'format',
  'freeze',
  'generate',
  'get',
  'handle',
  'has',
  'hide',
  'intercept',
  'is',
  'list',
  'load',
  'mask',
  'measure',
  'move',
  'normalize',
  'omit',
  'on',
  'open',
  'pack',
  'pad',
  'parse',
  'pick',
  'print',
  'read',
  'register',
  'remove',
  'reset',
  'resolve',
  'round',
  'run',
  'sanitize',
  'schedule',
  'select',
  'send',
  'set',
  'show',
  'sleep',
  'sort',
  'split',
  'strip',
  'throw',
  'to',
  'toggle',
  'transform',
  'truncate',
  'update',
  'use',
  'validate',
  'visit',
  'wait',
  'write',
];
// main(), the names of the Utils design and Angular's lifecycle hooks keep their names; object literal keys are not checked.
const FUNCTION_NAME_EXCEPTIONS = '^(?:main|deepClone|customEquality|endOfDay|localDateTimeToDate|sha256|sha512|startOfDay|ng[A-Z]\\w*)$';
const FUNCTION_NAME = `^\\u0275?(?:${FUNCTION_VERBS.join('|')})(?![a-z])`;
const FUNCTION_NAME_MESSAGE = 'Functions start with a verb of FUNCTION_VERBS in eslint.config.mjs (getEntryFiles, not entryFiles).';
const FUNCTION_NAME_SELECTORS = [
  {
    selector: `VariableDeclarator${FUNCTION_VALUE} > Identifier.id:not([name=/${FUNCTION_NAME}/])`,
    message: FUNCTION_NAME_MESSAGE,
  },
  {
    selector: `PropertyDefinition[value.type=${FUNCTION_VALUE_TYPES}] > Identifier.key:not([name=/${FUNCTION_NAME}/])`,
    message: FUNCTION_NAME_MESSAGE,
  },
];
const COMMON_SELECTORS = [
  ...MESSAGE_SELECTORS,
  ...LIFECYCLE_HOOK_SELECTORS,
  ...CODE_SHAPE_SELECTORS,
  ...FUNCTION_NAME_SELECTORS,
  { selector: 'Identifier[name=/\\$$/]', message: 'Observables end in `Observable`, not `$` (itemsObservable).' },
];

// The libraries export what their designs fix: there, these rules only see unexported code, function bodies and internal members.
const INTERNAL_ACCESS = ":matches([accessibility='private'], [accessibility='protected'])";
function selectInternalCode(selector, subject) {
  const selectors = [
    `${selector}:not(ExportNamedDeclaration ${subject})`,
    `ExportNamedDeclaration BlockStatement ${selector}`,
    `ExportNamedDeclaration :matches(PropertyDefinition, MethodDefinition)${INTERNAL_ACCESS} ${selector}`,
  ];
  if (selector.startsWith('PropertyDefinition')) {
    selectors.push(`ExportNamedDeclaration ${selector.replace('PropertyDefinition', `PropertyDefinition${INTERNAL_ACCESS}`)}`);
  }
  return selectors;
}
const NAMED_DECLARATIONS = ['Identifier[name!=NAME]', 'PropertyDefinition[key.name!=NAME]', 'TSPropertySignature[key.name!=NAME]'];
function createNamingSelectors(namePattern, types, subject, message) {
  return NAMED_DECLARATIONS.flatMap((declaration) =>
    types.map((type) => ({ selector: `${declaration.replace('NAME', namePattern)} > TSTypeAnnotation > ${type}`, subject, message })),
  );
}
const SUBJECT_TYPE = 'TSTypeReference[typeName.name=/^(?:Subject|BehaviorSubject|ReplaySubject|AsyncSubject)$/]';
const NAMING_RULES = [
  ...createNamingSelectors(
    '/^(?:is|has|can)[A-Z]|^(?:IS|HAS|CAN)_/',
    [
      'TSBooleanKeyword',
      'TSUnionType > TSBooleanKeyword',
      'TSTypeReference[typeName.name=/^(?:Signal|WritableSignal)$/] > TSTypeParameterInstantiation > TSBooleanKeyword',
    ],
    'TSBooleanKeyword',
    'Booleans start with is, has or can (isOpen, hasError, canSubmit).',
  ),
  ...createNamingSelectors(
    '/Observable$/',
    ["TSTypeReference[typeName.name='Observable']", "TSUnionType > TSTypeReference[typeName.name='Observable']"],
    'TSTypeReference',
    'Observables end in `Observable` (itemsObservable).',
  ),
  ...createNamingSelectors('/Subject$/', [SUBJECT_TYPE], 'TSTypeReference', 'Subjects end in `Subject` (itemsSubject).'),
];
// A Subject is never public, not even in the libraries: it is exposed with asObservable() as xObservable.
const SUBJECT_SELECTORS = forbid(
  [`PropertyDefinition:not([accessibility='private']) > TSTypeAnnotation > ${SUBJECT_TYPE}`],
  'Subjects are private: expose them with asObservable() as xObservable.',
);
const NAMING_SELECTORS = NAMING_RULES.map(({ selector, message }) => ({ selector, message }));
const LIBRARY_NAMING_SELECTORS = NAMING_RULES.flatMap(({ selector, subject, message }) =>
  selectInternalCode(selector, subject).map((internalSelector) => ({ selector: internalSelector, message })),
);
const NULL_MESSAGE = 'Internal code uses null for "no value": undefined only comes from the language, and is only compared.';
const NULL_RULES = [
  { selector: "Identifier[name='undefined']:not(BinaryExpression > Identifier)", subject: 'Identifier' },
  ...[':function', 'TSMethodSignature', 'TSFunctionType'].map((owner) => ({
    selector: `${owner} > TSTypeAnnotation TSUndefinedKeyword`,
    subject: 'TSUndefinedKeyword',
  })),
];
const NULL_SELECTORS = NULL_RULES.map(({ selector }) => ({ selector, message: NULL_MESSAGE }));
const LIBRARY_NULL_SELECTORS = NULL_RULES.flatMap(({ selector, subject }) =>
  selectInternalCode(selector, subject).map((internalSelector) => ({ selector: internalSelector, message: NULL_MESSAGE })),
);
const GENERAL_SELECTORS = [...COMMON_SELECTORS, ...NAMING_SELECTORS, ...NULL_SELECTORS, ...SUBJECT_SELECTORS];
const ANGULAR_SELECTORS = [
  ...forbid(
    ['Decorator[expression.callee.name=/^(?:Input|Output)$/]'],
    'Inputs and outputs are declared with input(), model() and output(), not with decorators.',
  ),
  ...forbid(
    ["CallExpression[callee.name='takeUntilDestroyed'][arguments.length=0]"],
    'Pass the DestroyRef: takeUntilDestroyed(this.destroyRef).',
  ),
  ...forbid(["CallExpression[callee.name='takeUntil']"], 'Subscriptions end with takeUntilDestroyed(this.destroyRef).'),
  ...forbid(["CallExpression[callee.name='outputFromObservable']"], 'Outputs are declared with output().'),
  ...forbid(
    [
      "CallExpression[callee.property.name='subscribe'][arguments.length>1]",
      "CallExpression[callee.property.name='subscribe'] > ObjectExpression > Property[key.name='error']",
    ],
    'The errors of an Observable are handled with catchError inside pipe().',
  ),
];
// The one service that keeps a subscription alive on purpose disables the rule with its reason.
const SERVICE_SELECTORS = forbid(
  ["CallExpression[callee.property.name='subscribe']"],
  'Services do not subscribe: they expose state with toSignal() and return the Observable for the rest.',
);
// Options that are not an enum, a boolean or an integer keep their own reader (see Exceptions in CONTRIBUTING.md).
const OWN_READER_OPTIONS = '/^(?:customEquality|fields|protocols|accept|columns|signal)$/';
const OTHER_THAN_OWN_READER_OPTIONS = `:not([property.name=${OWN_READER_OPTIONS}]):not([property.value=${OWN_READER_OPTIONS}])`;
const OPTION_SELECTORS = forbid(
  [
    `MemberExpression[object.name='options']${OTHER_THAN_OWN_READER_OPTIONS}`,
    `MemberExpression[object.expression.name='options']${OTHER_THAN_OWN_READER_OPTIONS}`,
    "VariableDeclarator[id.type='ObjectPattern'][init.name='options']",
    "VariableDeclarator[id.type='ObjectPattern'][init.left.name='options']",
    `CallExpression[callee.name='\u0275getOwnDataValue'][arguments.0.name='options']:not([arguments.1.value=${OWN_READER_OPTIONS}])`,
  ],
  'Options are read with the readers of the root: \u0275parseEnumOption, \u0275parseBooleanOption, \u0275parseIntegerOption or \u0275parseTextOption, and \u0275read...Option in the is... functions.',
);
const LIBRARY_GENERAL_SELECTORS = [
  ...COMMON_SELECTORS,
  ...OPTION_SELECTORS,
  ...LIBRARY_NAMING_SELECTORS,
  ...LIBRARY_NULL_SELECTORS,
  ...SUBJECT_SELECTORS,
  ...ANGULAR_SELECTORS,
];
// Tests compare with undefined when the code under test returns it.
const TEST_SELECTORS = [...COMMON_SELECTORS, ...NAMING_SELECTORS];
const TOKEN_CLASSES = '/^(?:InjectionToken|HttpContextToken)$/';
const EXEMPT_FILES = ['**/*.spec.ts', '**/*.test-d.ts', '**/*.d.ts'];
const NAMED_OBJECT_TYPES_MESSAGE = 'Object types get a name: declare an interface in interfaces/.';
const NAMED_OBJECT_TYPES = forbid(['TSTypeLiteral'], NAMED_OBJECT_TYPES_MESSAGE);
const LIBRARY_NAMED_OBJECT_TYPES = forbid(selectInternalCode('TSTypeLiteral', 'TSTypeLiteral'), NAMED_OBJECT_TYPES_MESSAGE);
const LIBRARY_FILES = 'projects/**/';
const PUBLIC_PROPERTY = "PropertyDefinition:not([accessibility='private']):not([accessibility='protected'])";
// The name of an error class is its literal value: a JSDoc there would only repeat it.
const ERROR_CLASS_NAME = "[override=true][readonly=true][key.name='name']";
function createJsdocOptions(publicProperty) {
  return {
    publicOnly: { esm: true },
    require: { FunctionDeclaration: true, ClassDeclaration: true, MethodDefinition: true },
    contexts: [
      'TSInterfaceDeclaration',
      'TSTypeAliasDeclaration',
      'TSEnumDeclaration',
      'ExportNamedDeclaration > VariableDeclaration',
      publicProperty,
    ],
    checkConstructors: false,
  };
}
const JSDOC_FUNCTION_DESCRIPTION = '^(?!(?:This|These|That|A|An|The|Helper|Utility|Wrapper)\\b)[A-Z][a-z]*s\\b[\\s\\S]*$';
const ERROR_CLASS = '/Error$/';
const CODE_FILE_SELECTORS = [
  ...forbid(['TSInterfaceDeclaration'], 'Interfaces go in interfaces/.'),
  ...forbid([`ClassDeclaration[superClass.name=${ERROR_CLASS}]`], 'Error classes go in errors/.'),
  ...forbid(['TSTypeAliasDeclaration'], 'Types go in types/.'),
  ...forbid(['TSEnumDeclaration'], 'Enums go in constants/.'),
  ...forbid(
    TOP_LEVEL.map((prefix) => `${prefix}VariableDeclaration > VariableDeclarator[init.type!=${FUNCTION_VALUE_TYPES}]`),
    'Top-level values go in constants/ or tokens/; module state goes inside a function.',
  ),
];
const TOP_LEVEL_DECLARATIONS = [
  'FunctionDeclaration',
  'VariableDeclaration',
  'ClassDeclaration',
  'TSEnumDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
];
function allowOnly(allowedDeclarations, message, forbiddenForms = []) {
  const forbidden = [...TOP_LEVEL_DECLARATIONS.filter((declaration) => !allowedDeclarations.includes(declaration)), ...forbiddenForms];
  return forbid(
    TOP_LEVEL.flatMap((prefix) => forbidden.map((declaration) => `${prefix}${declaration}`)),
    message,
  );
}
const INTERFACE_FILE_SELECTORS = allowOnly(['TSInterfaceDeclaration'], 'Files in interfaces/ only declare interfaces; types go in types/.');
const TYPE_FILE_SELECTORS = allowOnly(['TSTypeAliasDeclaration'], 'Files in types/ only declare types; interfaces go in interfaces/.');
const ERROR_FILE_SELECTORS = allowOnly(['ClassDeclaration'], 'Files in errors/ only declare classes that extend an error.', [
  `ClassDeclaration:not([superClass.name=${ERROR_CLASS}])`,
]);
const TOKEN_FILE_SELECTORS = allowOnly(['VariableDeclaration'], 'Files in tokens/ only declare Angular tokens.', [
  `VariableDeclaration > VariableDeclarator[init.callee.name!=${TOKEN_CLASSES}]`,
]);
const CONSTANT_FILE_SELECTORS = [
  ...forbid(
    TOP_LEVEL.map(
      (prefix) =>
        `${prefix}VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]):not([init.type='TSAsExpression'][init.typeAnnotation.typeName.name='const'])`,
    ),
    'Constants declare their type, or end in `as const` when they are a closed list.',
  ),
  ...allowOnly(['VariableDeclaration', 'TSEnumDeclaration'], 'Files in constants/ only declare constants and enums.'),
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
// no-restricted-syntax takes the last matching block whole, so every block repeats the common selectors.
const FILE_KINDS = [
  { pattern: '*.ts', selectors: CODE_FILE_SELECTORS },
  { pattern: '*.service.ts', selectors: [...CODE_FILE_SELECTORS, ...SERVICE_SELECTORS], isLibraryOnly: true },
  { pattern: 'interfaces/**/*.ts', selectors: INTERFACE_FILE_SELECTORS },
  { pattern: 'types/**/*.ts', selectors: TYPE_FILE_SELECTORS },
  {
    pattern: 'constants/**/*.ts',
    selectors: CONSTANT_FILE_SELECTORS,
    // A closed list is `as const`, and its type is derived from it in types/.
    rules: { '@typescript-eslint/typedef': ['error', { ...TYPEDEF_OPTIONS, variableDeclaration: false }] },
  },
  { pattern: 'tokens/**/*.ts', selectors: TOKEN_FILE_SELECTORS },
  {
    pattern: 'errors/**/*.ts',
    selectors: ERROR_FILE_SELECTORS,
    // The name of an error class is a literal type with its type annotation, as typedef asks.
    rules: { '@typescript-eslint/prefer-as-const': 'off', 'max-classes-per-file': ['error', 1] },
  },
];

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
      '@typescript-eslint/consistent-type-imports': 'error',
      // One inner list: the groups keep their order but are not separated by blank lines.
      'simple-import-sort/imports': [
        'error',
        { groups: [['^\\u0000', '^node:', '^@?\\w', '^@antoniocorraliza(?:/|$)', '^@foundry-test(?:/|$)', '^\\.']] },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['function', 'classMethod', 'typeMethod'],
          format: null,
          filter: { regex: FUNCTION_NAME_EXCEPTIONS, match: false },
          custom: { regex: FUNCTION_NAME, match: true },
        },
      ],
      '@typescript-eslint/consistent-generic-constructors': ['error', 'type-annotation'],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      '@typescript-eslint/no-inferrable-types': 'off',
      // Deprecated in typescript-eslint 8.33 but still working, and nothing else requires annotations on variables.
      '@typescript-eslint/typedef': ['error', TYPEDEF_OPTIONS],
    },
  },
  ...FILE_KINDS.filter(({ isLibraryOnly }) => !isLibraryOnly).map(({ pattern, selectors, rules }) => ({
    files: [`**/${pattern}`],
    ignores: EXEMPT_FILES,
    rules: { ...rules, 'no-restricted-syntax': ['error', ...GENERAL_SELECTORS, ...NAMED_OBJECT_TYPES, ...selectors] },
  })),
  ...FILE_KINDS.map(({ pattern, selectors }) => ({
    files: [`${LIBRARY_FILES}${pattern}`],
    ignores: EXEMPT_FILES,
    rules: { 'no-restricted-syntax': ['error', ...LIBRARY_GENERAL_SELECTORS, ...LIBRARY_NAMED_OBJECT_TYPES, ...selectors] },
  })),
  {
    files: EXEMPT_FILES,
    rules: { 'no-restricted-syntax': ['error', ...TEST_SELECTORS] },
  },
  {
    files: ['projects/**/*.ts'],
    ignores: EXEMPT_FILES,
    plugins: { jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      'jsdoc/require-jsdoc': ['error', createJsdocOptions(PUBLIC_PROPERTY)],
      'jsdoc/match-description': [
        'error',
        {
          contexts: ['FunctionDeclaration', 'MethodDefinition', 'TSMethodSignature'],
          matchDescription: JSDOC_FUNCTION_DESCRIPTION,
          message: 'A function description starts with a verb in the third person ("Parses...", "Returns...").',
          tags: { example: { match: '^[^\\n]*$', message: 'An @example takes one line.' } },
        },
      ],
      'jsdoc/informative-docs': 'error',
      'jsdoc/require-throws': 'error',
      'jsdoc/no-types': 'error',
      'jsdoc/check-tag-names': ['error', { typed: true }],
      'jsdoc/check-param-names': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/no-blank-blocks': 'error',
      'jsdoc/no-blank-block-descriptions': 'error',
      // A pure annotation looks like a JSDoc tag to this rule; the bundlers need it written with @.
      'jsdoc/no-bad-blocks': ['error', { ignore: ['ts-check', 'ts-expect-error', 'ts-ignore', 'ts-nocheck', '__PURE__'] }],
      'jsdoc/no-multi-asterisks': 'error',
      'jsdoc/check-alignment': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error',
      '@angular-eslint/component-max-inline-declarations': ['error', { template: 0, styles: 0, animations: 0 }],
      '@angular-eslint/consistent-component-styles': ['error', 'string'],
    },
  },
  {
    files: ['projects/**/errors/**/*.ts'],
    ignores: EXEMPT_FILES,
    rules: { 'jsdoc/require-jsdoc': ['error', createJsdocOptions(`${PUBLIC_PROPERTY}:not(${ERROR_CLASS_NAME})`)] },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
]);
