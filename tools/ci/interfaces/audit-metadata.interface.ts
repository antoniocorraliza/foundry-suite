import type { AuditCounts } from '../types/audit-counts.type.ts';

export interface AuditMetadata {
  readonly vulnerabilities?: AuditCounts;
}
