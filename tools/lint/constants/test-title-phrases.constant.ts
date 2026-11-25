/** Phrases that tell how the code was made or where a rule came from, not what a test checks. */
export const PROCESS_TITLE_PHRASE: RegExp =
  /\b(?:as the design|of the design|the design (?:fixes|says|leaves)|loose reference|old version|of this entry)\b/i;
