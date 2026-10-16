#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeWrite, type HookSource } from '../hooks/adapter.ts';
import { decide, type Decision } from '../security/decide.ts';
import { scan, type Finding } from '../security/scan.ts';

export interface ProcessWriteDeps {
  repoRoot?: string;
  readFile?: (path: string) => string | null;
  scan?: typeof scan;
  now?: () => number;
  watchdogMs?: number;
}

export interface ProcessResult {
  exitCode: 0 | 1 | 2;
  stdout: string;
  stderr: string;
}

function parseInput(rawStdin: string | Uint8Array | unknown): unknown {
  if (typeof rawStdin === 'string') return JSON.parse(rawStdin);
  if (rawStdin instanceof Uint8Array) return JSON.parse(new TextDecoder().decode(rawStdin));
  return rawStdin;
}

function askResult(source: HookSource, reason: string): ProcessResult {
  if (source === 'claude') {
    return {
      exitCode: 0,
      stdout: JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: reason,
        },
      }),
      stderr: '',
    };
  }
  return {
    exitCode: 2,
    stdout: '',
    stderr: `CONFIRMAÇÃO NECESSÁRIA: ${reason}\nPeça confirmação ao usuário e repita a escrita com security-ignore: <categoria> -- <justificativa>.`,
  };
}

function decisionResult(source: HookSource, decision: Decision): ProcessResult {
  if (decision.kind === 'allow') return { exitCode: 0, stdout: '', stderr: '' };
  if (decision.kind === 'block') return { exitCode: 2, stdout: '', stderr: decision.stderr };
  return askResult(source, decision.reason);
}

function errorReason(error: unknown): string {
  return `erro interno do Hook_Seguranca: ${error instanceof Error ? error.message : String(error)}`;
}

/** Processa um payload de escrita sem acessar stdin/stdout, facilitando testes. */
export function processWrite(
  rawStdin: string | Uint8Array | unknown,
  source: HookSource,
  deps: ProcessWriteDeps = {},
): ProcessResult {
  try {
    const root = deps.repoRoot ?? process.cwd();
    const readExisting =
      deps.readFile ??
      ((path: string): string | null => {
        try {
          return readFileSync(join(root, path), 'utf8');
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
          throw error;
        }
      });
    const raw = parseInput(rawStdin);
    const event = normalizeWrite(raw, source, readExisting, root);
    const scanFn = deps.scan ?? scan;
    const now = deps.now ?? Date.now;
    const started = now();
    const findings = scanFn(event.filePath, event.content);
    const elapsed = now() - started;
    if (elapsed > (deps.watchdogMs ?? 4000)) return askResult(source, 'scan-timeout: a varredura excedeu 4 segundos.');
    return decisionResult(source, decide(findings));
  } catch (error) {
    return askResult(source, errorReason(error));
  }
}

function warningLines(findings: readonly Finding[]): string {
  return findings
    .filter((finding) => finding.severity === 'warning')
    .map((finding) => `::warning file=${finding.filePath},line=${finding.line}::${finding.suggestion}`)
    .join('\n');
}

/** Varre arquivos existentes no modo CI (`--files`). */
export function processFiles(files: readonly string[], repoRoot: string = process.cwd()): ProcessResult {
  const findings: Finding[] = [];
  try {
    for (const file of files) {
      const content = readFileSync(join(repoRoot, file), 'utf8');
      findings.push(...scan(file.replace(/\\/g, '/'), content));
    }
  } catch (error) {
    return { exitCode: 1, stdout: '', stderr: `falha ao ler arquivo para security:scan: ${errorReason(error)}` };
  }
  const decision = decide(findings);
  if (decision.kind === 'block') {
    return { exitCode: 1, stdout: warningLines(findings), stderr: decision.stderr };
  }
  if (decision.kind === 'ask') return { exitCode: 0, stdout: warningLines(findings), stderr: '' };
  return { exitCode: 0, stdout: warningLines(findings), stderr: '' };
}

function argumentValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

function main(): void {
  const argv = process.argv.slice(2);
  const sourceValue = argumentValue(argv, '--source') ?? 'cli';
  const source = sourceValue as HookSource;
  const filesIndex = argv.indexOf('--files');
  const result =
    filesIndex >= 0
      ? processFiles(argv.slice(filesIndex + 1).filter((value) => !value.startsWith('--')))
      : processWrite(readFileSync(0, 'utf8'), source);
  if (result.stdout) process.stdout.write(`${result.stdout}\n`);
  if (result.stderr) process.stderr.write(`${result.stderr}\n`);
  process.exitCode = result.exitCode;
}

if (import.meta.main) main();
