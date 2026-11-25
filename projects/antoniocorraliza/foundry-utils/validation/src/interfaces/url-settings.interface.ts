import type { DefaultProtocol } from '../types/default-protocol.type';

/** Options of the URL functions once they are read. */
export interface UrlSettings {
  readonly protocols: ReadonlyArray<string>;
  readonly allowMissingProtocol: boolean;
  readonly defaultProtocol: DefaultProtocol;
}
