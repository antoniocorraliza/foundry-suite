import type { AuditSeverity } from './audit-severity.type.ts';

export interface AuditVulnerability {
  readonly severity: AuditSeverity;
  readonly isDirect: boolean;
}

export interface AuditReport {
  readonly metadata?: { readonly vulnerabilities?: Partial<Record<AuditSeverity | 'total', number>> };
  readonly vulnerabilities?: Record<string, AuditVulnerability>;
}
