/** Names how the functions of Utils treat a value; for internal use of the entries. */
export type ɵFoundryValueKind =
  | 'primitive'
  | 'function'
  | 'plainObject'
  | 'array'
  | 'date'
  | 'regExp'
  | 'map'
  | 'set'
  | 'arrayBuffer'
  | 'view'
  | 'blob'
  | 'error'
  | 'weakCollection'
  | 'other';
