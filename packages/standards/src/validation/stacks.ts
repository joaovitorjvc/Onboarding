import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { globMatcher, toPosix } from '../core/paths.ts';
import type { StandardsConfig } from '../core/types.ts';

export type StackId = 'web' | 'api' | 'standards' | 'contracts' | `ai:${string}`;

export interface StackCommands {
  lint: string[];
  typecheck: string[];
  test: string[];
  cwd: string;
}

function add(stack: StackId, result: Set<StackId>): void {
  result.add(stack);
}

/** Detecta as stacks atingidas por caminhos alterados, sem considerar o Site_Legado. */
export function detectAffectedStacks(
  changedFiles: readonly string[],
  config: StandardsConfig,
  aiModules: readonly string[] = [],
): StackId[] {
  const result = new Set<StackId>();
  const legacy = globMatcher(config.legacyPaths);
  const knownAi = [...new Set(aiModules)];

  for (const rawPath of changedFiles) {
    const path = toPosix(rawPath);
    if (!path || legacy(path)) continue;

    if (path.startsWith('apps/web/')) add('web', result);
    if (path.startsWith('apps/api/')) add('api', result);

    const aiMatch = path.match(/^services\/ai\/([^/]+)(?:\/|$)/);
    if (aiMatch?.[1]) add(`ai:${aiMatch[1]}`, result);

    if (path.startsWith('packages/standards/')) add('standards', result);
    if (path.startsWith('packages/config/')) add('standards', result);
    if (path.startsWith('packages/contracts/')) {
      add('web', result);
      add('api', result);
      if (path.startsWith('packages/contracts/python/')) {
        for (const module of knownAi) add(`ai:${module}`, result);
      }
    }
  }

  return [...result].sort();
}

function javascriptCommand(packageName: string, task: string): string[] {
  return ['pnpm', '--filter', packageName, task];
}

/** Retorna os comandos padronizados de uma stack. */
export function commandsFor(stack: StackId): StackCommands {
  if (stack === 'web') {
    return {
      lint: javascriptCommand('@nuagehub/web', 'lint'),
      typecheck: javascriptCommand('@nuagehub/web', 'typecheck'),
      test: javascriptCommand('@nuagehub/web', 'test'),
      cwd: '.',
    };
  }
  if (stack === 'api') {
    return {
      lint: javascriptCommand('@nuagehub/api', 'lint'),
      typecheck: javascriptCommand('@nuagehub/api', 'typecheck'),
      test: javascriptCommand('@nuagehub/api', 'test'),
      cwd: '.',
    };
  }
  if (stack === 'standards') {
    return {
      lint: javascriptCommand('@nuagehub/standards', 'lint'),
      typecheck: javascriptCommand('@nuagehub/standards', 'typecheck'),
      test: javascriptCommand('@nuagehub/standards', 'test'),
      cwd: '.',
    };
  }
  if (stack === 'contracts') {
    return {
      lint: javascriptCommand('@nuagehub/contracts', 'lint'),
      typecheck: javascriptCommand('@nuagehub/contracts', 'typecheck'),
      test: javascriptCommand('@nuagehub/contracts', 'test'),
      cwd: '.',
    };
  }

  const moduleName = stack.slice('ai:'.length);
  return {
    lint: ['uv', 'run', 'ruff', 'check', '.'],
    typecheck: ['uv', 'run', 'mypy', '--config-file', '../../../mypy.ini', 'src'],
    test: ['uv', 'run', 'pytest'],
    cwd: join('services', 'ai', moduleName),
  };
}

/** Lista módulos de IA existentes no monorepo. */
export function discoverAiModules(root: string): string[] {
  const base = join(root, 'services', 'ai');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(base, entry.name, 'pyproject.toml')))
    .map((entry) => entry.name)
    .sort();
}
