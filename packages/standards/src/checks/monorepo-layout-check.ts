// monorepoLayoutCheck: estrutura obrigatória do Monorepo (Req. 8.1–8.5, 8.7).
import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

/** Arquivos obrigatórios na raiz e em cada área do Monorepo. */
export const REQUIRED_FILES: readonly { path: string; requirement: string }[] = [
  { path: 'apps/web/package.json', requirement: '8.1' },
  { path: 'apps/api/package.json', requirement: '8.1' },
  { path: '.kiro/constitution.md', requirement: '8.2' },
  { path: '.kiro/agents/nuagehub.json', requirement: '8.2' },
  { path: 'CLAUDE.md', requirement: '8.2' },
  { path: '.claude/settings.json', requirement: '8.2' },
  { path: 'scripts/hooks/pre-write-security', requirement: '8.2' },
  { path: 'scripts/hooks/post-task-validation', requirement: '8.2' },
  { path: 'pnpm-workspace.yaml', requirement: '8.3' },
  { path: 'pnpm-lock.yaml', requirement: '8.3' },
  { path: '.nvmrc', requirement: '8.7' },
  { path: '.python-version', requirement: '8.7' },
];

const REQUIRED_PREFIXES: readonly { prefix: string; requirement: string }[] = [
  { prefix: '.kiro/specs/', requirement: '8.2' },
  { prefix: '.kiro/steering/', requirement: '8.2' },
  { prefix: 'packages/', requirement: '8.1' },
  { prefix: 'services/ai/', requirement: '8.1' },
];

/** Diretórios de primeiro nível de `base/*` presentes no snapshot. */
function childDirs(paths: readonly string[], base: string): string[] {
  const dirs = new Set<string>();
  for (const p of paths) {
    if (!p.startsWith(`${base}/`)) continue;
    const rest = p.slice(base.length + 1);
    const slash = rest.indexOf('/');
    if (slash > 0) dirs.add(rest.slice(0, slash));
  }
  return [...dirs].sort();
}

export function monorepoLayoutViolations(snap: RepoSnapshot): Violation[] {
  const present = new Set(snap.paths);
  const v: Violation[] = [];
  for (const { path, requirement } of REQUIRED_FILES) {
    if (!present.has(path)) v.push({ file: path, requirement, message: 'arquivo obrigatório ausente' });
  }
  for (const { prefix, requirement } of REQUIRED_PREFIXES) {
    if (!snap.paths.some((p) => p.startsWith(prefix))) {
      v.push({ file: prefix, requirement, message: 'diretório obrigatório ausente ou vazio' });
    }
  }
  // Req. 8.3: um único lockfile JS, na raiz.
  for (const p of snap.paths) {
    const name = p.split('/').pop() ?? '';
    const isJsLock = ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb', 'bun.lock'].includes(name);
    if (isJsLock && p !== 'pnpm-lock.yaml') {
      v.push({ file: p, requirement: '8.3', message: 'lockfile JavaScript fora da raiz ou de outro gerenciador' });
    }
  }
  // Req. 8.4 e 8.5: cada Modulo_IA com pyproject.toml, uv.lock e README.md.
  for (const m of childDirs(snap.paths, 'services/ai')) {
    for (const f of ['pyproject.toml', 'uv.lock', 'README.md']) {
      const path = `services/ai/${m}/${f}`;
      if (!present.has(path)) {
        v.push({ file: path, requirement: f === 'README.md' ? '8.5' : '8.4', message: 'arquivo obrigatório ausente' });
      }
    }
  }
  // Req. 8.5: cada aplicação com README.md.
  for (const app of childDirs(snap.paths, 'apps')) {
    const path = `apps/${app}/README.md`;
    if (!present.has(path)) v.push({ file: path, requirement: '8.5', message: 'README.md da aplicação ausente' });
  }
  return v;
}

export const monorepoLayoutCheck: NamedCheck = { name: 'monorepo-layout-check', run: monorepoLayoutViolations };
