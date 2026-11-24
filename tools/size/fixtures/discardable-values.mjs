export function getKeptFixtureValue() {
  return 'kept fixture function';
}
export const pureFixtureOptions = /* @__PURE__ */ Object.freeze({ droppedFixtureKey: 'dropped fixture options' });
export const impureFixtureOptions = Object.freeze({ keptFixtureKey: globalThis.readFixtureSuffix?.() });
