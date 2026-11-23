export function listTwoLetterRegions(): Array<string> {
  const letters: Array<string> = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  return letters.flatMap((first) => letters.map((second) => `${first}${second}`));
}
