import type { TypescriptConsumerCheck } from '../interfaces/typescript-consumer-check.interface.ts';

export const TYPESCRIPT_CONSUMER_CHECKS: ReadonlyArray<TypescriptConsumerCheck> = [
  { compiler: 'typescript-5.5', project: 'tsconfig.dom.json', expectedError: null },
  { compiler: 'typescript-5.5', project: 'tsconfig.node.json', expectedError: null },
  { compiler: 'typescript-5.5', project: 'tsconfig.commonjs.json', expectedError: 'TS1479' },
  { compiler: 'typescript-6.0', project: 'tsconfig.dom.json', expectedError: null },
  { compiler: 'typescript-6.0', project: 'tsconfig.node.json', expectedError: null },
  { compiler: 'typescript-6.0', project: 'tsconfig.commonjs.json', expectedError: null },
  { compiler: 'typescript-7', project: 'tsconfig.dom.json', expectedError: null },
  { compiler: 'typescript-7', project: 'tsconfig.node.json', expectedError: null },
  { compiler: 'typescript-7', project: 'tsconfig.commonjs.json', expectedError: null },
];
