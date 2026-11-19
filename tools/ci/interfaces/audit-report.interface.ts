import type { AuditMetadata } from './audit-metadata.interface.ts';
import type { AuditVulnerability } from './audit-vulnerability.interface.ts';

export interface AuditReport {
  readonly metadata?: AuditMetadata;
  readonly vulnerabilities?: Record<string, AuditVulnerability>;
}
