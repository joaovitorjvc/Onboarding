#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { findRepoRoot, loadConfig } from '../core/snapshot.ts';
import { commandsFor, detectAffectedStacks, type StackId } from '../validation/stacks.ts';
import { report, type CheckResult } from '../validation/report.ts';
import type { StandardsConfig } from '../core/types.ts';

interface HookInput {
  stop_hook_active?: boolean;
}

export interface ValidationRun {
  results: CheckResult[];
  exitCode: 0 | 2;
  message: string;
}

export function parseHookInput(raw: string): HookInput {
  if (!raw.trim()) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed as HookInput;
}

export function discoverAiModules(root: string): string[] {
  const base = join(root, 'services', 'ai');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(base, entry.name, 'pyproject.toml')))
    .map((entry) => entry.name)
    .sort();
}

export function listChangedFiles(root: string): string[] {
  const git = (args: string[]): string[] =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
      .split(/\0|\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: root, encoding: 'utf8' });
    return [
      ...new Set([...git(['diff', '--name-only', 'HEAD']), ...git(['ls-files', '--others', '--exclude-standard'])]),
    ];
  } catch {
    return git(['ls-files', '--cached', '--others', '--exclude-standard']);
  }
}

function runCommand(command: string[], cwd: string): { status: number; output: string } {
  const result = spawnSync(command[0]!, command.slice(1), {
    cwd,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error)
    return { status: 127, output: `${result.error.message}\nverificação setup: ferramenta ausente (${command[0]})` };
  return { status: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function runStack(root: string, stack: StackId): CheckResult[] {
  const commands = commandsFor(stack);
  const cwd = resolve(root, commands.cwd);
  if (!existsSync(cwd)) return [];
  if (stack.startsWith('ai:')) {
    const lint = runCommand(commands.lint, cwd);
    const format = runCommand(['uv', 'run', 'ruff', 'format', '--check', '.'], cwd);
    const lintOutput = `${lint.output}${format.output}`;
    const results: CheckResult[] = [
      { stack, check: 'lint', ok: lint.status === 0 && format.status === 0, output: lintOutput },
    ];
    if (commands.typecheck.length > 0) {
      const typecheck = runCommand(commands.typecheck, cwd);
      results.push({ stack, check: 'typecheck', ok: typecheck.status === 0, output: typecheck.output });
    }
    const test = runCommand(commands.test, cwd);
    results.push({ stack, check: 'test', ok: test.status === 0, output: test.output });
    return results;
  }

  return (['lint', 'typecheck', 'test'] as const).map((check) => {
    const command = commands[check];
    const result = runCommand(command, cwd);
    return { stack, check, ok: result.status === 0, output: result.output };
  });
}

export function affectedStacksForValidation(
  changedFiles: readonly string[],
  config: StandardsConfig,
  aiModules: readonly string[],
): StackId[] {
  return detectAffectedStacks(changedFiles, config, aiModules);
}

export function validateChangedFiles(
  root: string,
  changedFiles: readonly string[],
  config: StandardsConfig,
): ValidationRun {
  const stacks = affectedStacksForValidation(changedFiles, config, discoverAiModules(root));
  const results = stacks.flatMap((stack) => runStack(root, stack));
  const summary = report(results);
  return { results, exitCode: summary.exitCode, message: summary.message };
}

function main(): void {
  let root: string;
  try {
    root = findRepoRoot();
  } catch {
    process.stderr.write('não foi possível listar arquivos alterados\n');
    process.exitCode = 2;
    return;
  }

  let input: HookInput;
  try {
    input = parseHookInput(readFileSync(0, 'utf8'));
  } catch (error) {
    process.stderr.write(
      `não foi possível processar a entrada do hook: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 0;
    return;
  }

  let changedFiles: string[];
  try {
    changedFiles = listChangedFiles(root);
  } catch {
    process.stderr.write('não foi possível listar arquivos alterados\n');
    process.exitCode = 2;
    return;
  }
  const result = validateChangedFiles(root, changedFiles, loadConfig(root));
  if (result.message) process.stderr.write(`${result.message}\n`);
  process.exitCode = input.stop_hook_active ? 0 : result.exitCode;
}

if (import.meta.main) main();
