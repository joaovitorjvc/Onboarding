import type { Finding } from './scan.ts';

export type Decision = { kind: 'allow' } | { kind: 'block'; stderr: string } | { kind: 'ask'; reason: string };

function formatFinding(finding: Finding): string {
  return `${finding.filePath}:${finding.line} [${finding.category}] ${finding.suggestion}`;
}

/** Classifica achados: qualquer bloqueante vence, alertas pedem confirmação. */
export function decide(findings: readonly Finding[]): Decision {
  if (findings.length === 0) return { kind: 'allow' };
  const message = findings.map(formatFinding).join('\n');
  if (findings.some((finding) => finding.severity === 'blocking')) return { kind: 'block', stderr: message };
  return { kind: 'ask', reason: message };
}

export { formatFinding };
