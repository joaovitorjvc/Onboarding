#!/usr/bin/env node
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { findRepoRoot, loadConfig } from '../core/snapshot.ts';
import { commandsFor, detectAffectedStacks, type StackId } from '../validation/stacks.ts';

const TASKS = new Set(['dev', 'build', 'lint', 'typecheck', 'test']);

type Task = 'dev' | 'build' | 'lint' | 'typecheck' | 'test';

function changedFiles(root: string, base: string): string[] {
  const run = (args: string[]): string[] =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' })
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
  const committed = run(['diff', '--name-only', `${base}...HEAD`]);
  const local = run(['diff', '--name-only', 'HEAD']);
  const staged = run(['diff', '--name-only', '--cached']);
  const untracked = run(['ls-files', '--others', '--exclude-standard']);
  return [...new Set([...committed, ...local, ...staged, ...untracked])];
}

function packageHasScript(root: string, stack: StackId, task: Task): boolean {
  if (stack.startsWith('ai:')) return task !== 'build' || false;
  const packagePath =
    stack === 'web'
      ? 'apps/web'
      : stack === 'api'
        ? 'apps/api'
        : stack === 'standards'
          ? 'packages/standards'
          : 'packages/contracts';
  const path = join(root, packagePath, 'package.json');
  if (!existsSync(path)) return false;
  const packageJson = JSON.parse(readFileSync(path, 'utf8')) as { scripts?: Record<string, string> };
  return Boolean(packageJson.scripts?.[task]);
}

export function discoverStacks(root: string): StackId[] {
  const stacks: StackId[] = [];
  for (const [stack, directory] of [
    ['web', 'apps/web'],
    ['api', 'apps/api'],
    ['standards', 'packages/standards'],
    ['contracts', 'packages/contracts'],
  ] as const) {
    if (existsSync(join(root, directory, 'package.json'))) stacks.push(stack);
  }
  const aiRoot = join(root, 'services', 'ai');
  if (existsSync(aiRoot)) {
    for (const entry of readdirSync(aiRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(aiRoot, entry.name, 'pyproject.toml')))
        stacks.push(`ai:${entry.name}`);
    }
  }
  return stacks;
}

function run(command: string[], cwd: string): number {
  const result = spawnSync(command[0]!, command.slice(1), { cwd, stdio: 'inherit' });
  if (result.error) {
    process.stderr.write(`falha ao executar ${command.join(' ')}: ${result.error.message}\n`);
    return 1;
  }
  return result.status ?? 1;
}

function runStack(root: string, stack: StackId, task: Task): number {
  if (stack.startsWith('ai:') && task === 'build') return 0;
  if (!packageHasScript(root, stack, task)) return 0;
  const commands = commandsFor(stack);
  const cwd = resolve(root, commands.cwd);
  if (task === 'dev')
    return run(
      stack === 'web' ? ['pnpm', '--filter', '@nuagehub/web', 'dev'] : ['pnpm', '--filter', '@nuagehub/api', 'dev'],
      cwd,
    );
  if (stack.startsWith('ai:') && task === 'lint') {
    const lint = run(commands.lint, cwd);
    return lint === 0 ? run(['uv', 'run', 'ruff', 'format', '--check', '.'], cwd) : lint;
  }
  if (task === 'build')
    return run(
      [
        'pnpm',
        '--filter',
        stack === 'web'
          ? '@nuagehub/web'
          : stack === 'api'
            ? '@nuagehub/api'
            : stack === 'standards'
              ? '@nuagehub/standards'
              : '@nuagehub/contracts',
        task,
      ],
      cwd,
    );
  return run(commands[task === 'lint' ? 'lint' : task === 'typecheck' ? 'typecheck' : 'test'], cwd);
}

async function runDevInParallel(root: string, stacks: StackId[]): Promise<number> {
  const processes = stacks
    .filter((stack) => stack === 'web' || stack === 'api')
    .map((stack) => {
      const packageName = stack === 'web' ? '@nuagehub/web' : '@nuagehub/api';
      return spawn('pnpm', ['--filter', packageName, 'dev'], { cwd: root, stdio: 'inherit' });
    });
  if (processes.length === 0) return 0;
  const statuses = await Promise.all(
    processes.map(
      (child) => new Promise<number>((resolveStatus) => child.once('exit', (code) => resolveStatus(code ?? 1))),
    ),
  );
  return statuses.some((status) => status !== 0) ? 1 : 0;
}

export function parseArgs(argv: readonly string[]): { task: Task; affected: boolean; base: string } {
  const task = argv[0] as Task;
  const affectedArgument = argv.find((argument) => argument === '--affected' || argument.startsWith('--affected='));
  return { task, affected: Boolean(affectedArgument), base: affectedArgument?.split('=')[1] || 'origin/main' };
}

async function main(): Promise<void> {
  const { task, affected, base } = parseArgs(process.argv.slice(2));
  if (!TASKS.has(task)) {
    process.stderr.write('Uso: run.ts <dev|build|lint|typecheck|test> [--affected[=base]]\n');
    process.exitCode = 2;
    return;
  }
  let root: string;
  try {
    root = findRepoRoot();
  } catch {
    process.stderr.write('não foi possível localizar a raiz do repositório\n');
    process.exitCode = 2;
    return;
  }
  let stacks = discoverStacks(root);
  if (affected) {
    try {
      stacks = detectAffectedStacks(
        changedFiles(root, base),
        loadConfig(root),
        discoverStacks(root)
          .filter((stack) => stack.startsWith('ai:'))
          .map((stack) => stack.slice(3)),
      );
    } catch (error) {
      process.stderr.write(
        `não foi possível listar arquivos alterados: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 2;
      return;
    }
  }
  if (task === 'dev') {
    process.exitCode = await runDevInParallel(root, stacks);
    return;
  }
  let exitCode = 0;
  for (const stack of stacks) exitCode = Math.max(exitCode, runStack(root, stack, task));
  process.exitCode = exitCode;
}

if (import.meta.main) await main();
