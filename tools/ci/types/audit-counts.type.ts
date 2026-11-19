import type { AuditSeverity } from './audit-severity.type.ts';

export type AuditCounts = Partial<Record<AuditSeverity | 'total', number>>;
