import type { DEFAULT_PROTOCOLS } from '../constants/default-protocols.constant';

/** Protocol that `normalizeUrl` adds to a URL written without one. */
export type DefaultProtocol = (typeof DEFAULT_PROTOCOLS)[number];
