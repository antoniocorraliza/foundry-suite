/*
 * Report of `npm audit` for the development dependencies.
 *
 * It never fails: development vulnerabilities are reviewed from time to time, not
 * blocking. Production vulnerabilities do block, with `npm audit --omit=dev` in the
 * fast CI level.
 *
 * Usage: npm audit --json > audit.json; node tools/ci/audit-report.ts audit.json
 * Writes a table to the job summary (GITHUB_STEP_SUMMARY) or, outside CI, to stdout,
 * and a warning annotation when there is any high or critical vulnerability.
 */
import { appendFileSync, readFileSync } from 'node:fs';

const SEVERITIES = ['critical', 'high', 'moderate', 'low', 'info'] as const;
type Severity = (typeof SEVERITIES)[number];

interface AuditVulnerability {
  readonly severity: Severity;
  readonly isDirect: boolean;
}

interface AuditReport {
  readonly metadata?: { readonly vulnerabilities?: Partial<Record<Severity | 'total', number>> };
  readonly vulnerabilities?: Record<string, AuditVulnerability>;
}

const file = process.argv[2];
if (file === undefined) {
  console.error('Usage: node tools/ci/audit-report.ts <npm audit --json output>');
  process.exit(0);
}

let report: AuditReport;
try {
  report = JSON.parse(readFileSync(file, 'utf8')) as AuditReport;
} catch (error) {
  console.log(`::warning title=npm audit (development)::Could not read the audit report: ${String(error)}`);
  process.exit(0);
}

const counts = report.metadata?.vulnerabilities ?? {};
const packages = Object.entries(report.vulnerabilities ?? {});
const lines = [
  '### npm audit · development dependencies (report only)',
  '',
  '| Severity | Count |',
  '| :-- | --: |',
  ...SEVERITIES.map((severity) => `| ${severity} | ${counts[severity] ?? 0} |`),
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

const summary = process.env['GITHUB_STEP_SUMMARY'];
if (summary === undefined || summary === '') {
  console.log(lines.join('\n'));
} else {
  appendFileSync(summary, `${lines.join('\n')}\n`);
}

const serious = (counts.critical ?? 0) + (counts.high ?? 0);
if (serious > 0) {
  console.log(
    `::warning title=npm audit (development)::${serious} high or critical vulnerabilities in development dependencies. Review them (not blocking).`,
  );
}
