import type { NamedCheck, RepoSnapshot, Violation } from './types.ts';

/**
 * Executa todas as checagens. Uma exceção em uma checagem vira violação "interno"
 * daquela checagem, sem interromper as demais (design, Error Handling).
 */
export function runChecks(snap: RepoSnapshot, checks: readonly NamedCheck[]): Violation[] {
  const all: Violation[] = [];
  for (const check of checks) {
    try {
      all.push(...check.run(snap));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      all.push({ file: '(verificador)', requirement: 'interno', message: `checagem ${check.name} falhou: ${message}` });
    }
  }
  return sortViolations(all);
}

/** Ordena por arquivo, requisito e mensagem, removendo duplicatas exatas. */
export function sortViolations(violations: readonly Violation[]): Violation[] {
  const seen = new Set<string>();
  const unique: Violation[] = [];
  for (const v of violations) {
    const key = `${v.file}\u0000${v.requirement}\u0000${v.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(v);
    }
  }
  return unique.sort(
    (a, b) =>
      compare(a.file, b.file) || compareRequirement(a.requirement, b.requirement) || compare(a.message, b.message),
  );
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Compara "2.10" depois de "2.9"; valores não numéricos vão por ordem lexical. */
function compareRequirement(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  if (pa.some(Number.isNaN) || pb.some(Number.isNaN)) return compare(a, b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (d !== 0) return d;
  }
  return 0;
}

/** Uma linha por violação: `{arquivo} (Req. {x.y}): {mensagem}`. */
export function formatViolations(violations: readonly Violation[]): string {
  return sortViolations(violations)
    .map((v) => `${v.file} (Req. ${v.requirement}): ${v.message}`)
    .join('\n');
}

/** Código de saída do CLI: 1 com violações, 0 sem. */
export function exitCodeFor(violations: readonly Violation[]): 0 | 1 {
  return violations.length > 0 ? 1 : 0;
}
