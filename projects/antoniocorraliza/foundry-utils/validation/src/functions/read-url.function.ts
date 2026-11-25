import { IPV4_ADDRESS_PATTERN, URL_SCHEME_PATTERN, WRITTEN_URL_HOST_PATTERN } from '../constants/validation-patterns.constant';
import type { UrlSettings } from '../interfaces/url-settings.interface';

function parseUrl(text: string): URL | null {
  try {
    return new URL(text);
  } catch {
    return null;
  }
}

function isAcceptedHost(hostname: string, text: string): boolean {
  if (hostname.includes('%')) return false;
  if (hostname.startsWith('[') || hostname === 'localhost') return true;
  if (IPV4_ADDRESS_PATTERN.test(hostname)) return WRITTEN_URL_HOST_PATTERN.exec(text)?.[1]?.toLowerCase() === hostname;
  return hostname.includes('.') && !hostname.endsWith('.');
}

/** Reads a URL with options that are already checked, and returns it as the URL parser writes it, or `null` when it is not valid. */
export function readUrl(value: unknown, settings: UrlSettings): string | null {
  if (typeof value !== 'string') return null;
  const trimmed: string = value.trim();
  const hasScheme: boolean = URL_SCHEME_PATTERN.test(trimmed);
  if (!hasScheme && !settings.allowMissingProtocol) return null;
  const text: string = hasScheme ? trimmed : `${settings.defaultProtocol}//${trimmed}`;
  const url: URL | null = parseUrl(text);
  if (url === null || !settings.protocols.some((protocol) => protocol.toLowerCase() === url.protocol)) return null;
  if (url.username !== '' || url.password !== '') return null;
  return isAcceptedHost(url.hostname, text) ? url.href : null;
}
