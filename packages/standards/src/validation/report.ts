import type { StackId } from './stacks.ts';

export interface CheckResult {
  stack: StackId;
  check?: string;
  name?: string;
  output?: string;
  ok?: boolean;
  passed?: boolean;
  success?: boolean;
  failed?: boolean;
}

function isSuccessful(result: CheckResult): boolean {
  if (typeof result.ok === 'boolean') return result.ok;
  if (typeof result.passed === 'boolean') return result.passed;
  if (typeof result.success === 'boolean') return result.success;
  if (typeof result.failed === 'boolean') return !result.failed;
  return true;
}

/** Formata falhas de validação, preservando apenas as 40 últimas linhas. */
export function report(results: readonly CheckResult[]): { exitCode: 0 | 2; message: string } {
  const failures = results.filter((result) => !isSuccessful(result));
  const lines: string[] = [];
  for (const failure of failures) {
    const output = (failure.output ?? '').split(/\r?\n/);
    const tail = output.slice(-40).join('\n');
    const check = failure.check ?? failure.name ?? 'verificação';
    lines.push(`[${failure.stack}] ${check}: falhou`);
    if (tail) lines.push(tail);
  }
  return { exitCode: failures.length > 0 ? 2 : 0, message: lines.join('\n') };
}
