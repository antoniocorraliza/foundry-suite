// Project names cannot contain slashes.
export function getTimeZoneSlug(timeZone: string): string {
  return timeZone.replaceAll('/', '-');
}
