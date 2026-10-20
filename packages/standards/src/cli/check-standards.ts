#!/usr/bin/env node
// CLI do Verificador_de_Padroes: `pnpm standards:check [--changed-files a b c]` (Req. 17.4, 17.5).
import { ALL_CHECKS } from '../checks/registry.ts';
import { exitCodeFor, formatViolations, runChecks } from '../core/run-checks.ts';
import { findRepoRoot, loadSnapshot } from '../core/snapshot.ts';

export function parseArgs(argv: readonly string[]): { changedFiles?: string[] } {
  const i = argv.indexOf('--changed-files');
  if (i === -1) return {};
  return { changedFiles: argv.slice(i + 1).filter((a) => !a.startsWith('--')) };
}

function main(): void {
  const started = Date.now();
  const { changedFiles } = parseArgs(process.argv.slice(2));
  const root = findRepoRoot();
  const snap = loadSnapshot(root, changedFiles);
  const violations = runChecks(snap, ALL_CHECKS);
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  if (violations.length > 0) {
    process.stderr.write(`${formatViolations(violations)}\n`);
    process.stderr.write(`\n${violations.length} violação(ões) de padrão encontradas em ${elapsed}s.\n`);
  } else {
    process.stdout.write(`Padrões OK (${ALL_CHECKS.length} checagens, ${elapsed}s).\n`);
  }
  process.exitCode = exitCodeFor(violations);
}

if (import.meta.main) main();
