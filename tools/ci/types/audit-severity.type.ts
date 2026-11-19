import type { AUDIT_SEVERITIES } from '../constants/audit-severities.constant.ts';

export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];
