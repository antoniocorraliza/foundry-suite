import type { AuditCounts } from './audit-counts.type.ts';

export interface AuditMetadata {
  readonly vulnerabilities?: AuditCounts;
}
