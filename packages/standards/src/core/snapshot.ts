// Carregamento do RepoSnapshot (borda de I/O do verificador).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globMatcher, toPosix } from './paths.ts';
import { DEFAULT_CONFIG, type RepoSnapshot, type StandardsConfig } from './types.ts';

/** Arquivos cujo conteúdo é carregado no snapshot (design §4). Os demais entram só em `paths`. */
export const CONTENT_GLOBS = [
  '.kiro/**',
  '.claude/**',
  'CLAUDE.md',
  'docs/adr/**',
  'apps/*/README.md',
  'apps/*/package.json',
  'packages/*/package.json',
  'package.json',
  'services/ai/*/README.md',
  'services/ai/*/pyproject.toml',
  '.github/**',
  'standards.config.json',
  '.prettierignore',
  'eslint.config.mjs',
  'lefthook.yml',
];

export function findRepoRoot(cwd: string = process.cwd()): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim();
}

/** Lista arquivos versionados e não rastreados (sem ignorados) que ainda existem em disco. */
export function listRepoFiles(root: string): string[] {
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const unique = new Set(out.split('\0').filter(Boolean).map(toPosix));
  return [...unique].filter((p) => existsSync(join(root, p))).sort();
}

export function loadConfig(root: string): StandardsConfig {
  const file = join(root, 'standards.config.json');
  if (!existsSync(file)) return DEFAULT_CONFIG;
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<StandardsConfig>;
  return { ...DEFAULT_CONFIG, ...parsed, stacks: { ...DEFAULT_CONFIG.stacks, ...parsed.stacks } };
}

export function loadSnapshot(root: string, changedFiles?: readonly string[]): RepoSnapshot {
  const paths = listRepoFiles(root);
  const wanted = globMatcher(CONTENT_GLOBS);
  const files = new Map<string, string>();
  for (const p of paths) {
    if (wanted(p)) files.set(p, readFileSync(join(root, p), 'utf8'));
  }
  const snap: RepoSnapshot = { files, paths, config: loadConfig(root) };
  return changedFiles ? { ...snap, changedFiles: changedFiles.map(toPosix) } : snap;
}

/** Cria um snapshot em memória (testes). */
export function snapshotFrom(
  files: Record<string, string>,
  extra: { paths?: string[]; config?: StandardsConfig; changedFiles?: string[] } = {},
): RepoSnapshot {
  const map = new Map(Object.entries(files));
  const paths = [...new Set([...map.keys(), ...(extra.paths ?? [])])].sort();
  const snap: RepoSnapshot = { files: map, paths, config: extra.config ?? DEFAULT_CONFIG };
  return extra.changedFiles ? { ...snap, changedFiles: extra.changedFiles } : snap;
}
