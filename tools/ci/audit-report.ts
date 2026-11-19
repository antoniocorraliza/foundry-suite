import { appendFileSync, readFileSync } from 'node:fs';
import { AUDIT_SEVERITIES } from './constants/audit-severities.constant.ts';
import type { AuditReport, AuditVulnerability } from './interfaces/audit-report.interface.ts';
import type { AuditSeverity } from './interfaces/audit-severity.type.ts';

// Development vulnerabilities are reviewed from time to time, so this script never fails the job.
function main(): void {
  const file: string | undefined = process.argv[2];
  if (file === undefined) {
    console.error('[audit-report]: usage: node tools/ci/audit-report.ts <output of npm audit --json>');
    return;
  }

  let report: AuditReport;
  try {
    report = JSON.parse(readFileSync(file, 'utf8')) as AuditReport;
  } catch (error) {
    console.log(`::warning title=npm audit (development)::could not read the audit report: ${String(error)}`);
    return;
  }

  const counts: Partial<Record<AuditSeverity | 'total', number>> = report.metadata?.vulnerabilities ?? {};
  const packages: Array<[string, AuditVulnerability]> = Object.entries(report.vulnerabilities ?? {});
  const lines: Array<string> = [
    '### npm audit: development dependencies (report only)',
    '',
    '| Severity | Count |',
    '| :-- | --: |',
    ...AUDIT_SEVERITIES.map((severity) => `| ${severity} | ${counts[severity] ?? 0} |`),
    `| **total** | **${counts.total ?? 0}** |`,
    '',
  ];
  if (packages.length > 0) {
    lines.push(
      '| Package | Severity | Direct |',
      '| :-- | :-- | :-: |',
      ...packages.map(([name, vulnerability]) => `| ${name} | ${vulnerability.severity} | ${vulnerability.isDirect ? 'yes' : ''} |`),
      '',
    );
  }

  const summaryPath: string | undefined = process.env['GITHUB_STEP_SUMMARY'];
  if (summaryPath === undefined || summaryPath === '') console.log(lines.join('\n'));
  else appendFileSync(summaryPath, `${lines.join('\n')}\n`);

  const serious: number = (counts.critical ?? 0) + (counts.high ?? 0);
  if (serious > 0) {
    console.log(
      `::warning title=npm audit (development)::${serious} high or critical vulnerabilities in development dependencies, review them`,
    );
  }
}

main();
