/** Kind of a value, as the functions of Utils treat it. */
export type ɵValueKind =
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
