import { posix } from 'node:path';
import { parseFrontMatter } from '../steering/front-matter.ts';
import { toPosix } from '../core/paths.ts';
import { NAV_HEADINGS, NAV_TEXT } from './nav-text.ts';
import type { RepoSnapshot } from '../core/types.ts';

export interface ScopedRule {
  path: string;
  globs: string[];
  imports: string[];
}

export interface InvalidLine {
  file: string;
  line: number;
  section: string;
}

export interface ClaudeModel {
  imports: string[];
  onDemandRefs: string[];
  scopedRules: ScopedRule[];
  invalidLines: InvalidLine[];
}

function normalizePath(path: string): string {
  return toPosix(path).replace(/^\.\//, '');
}

function normalizeGlob(glob: string): string {
  return normalizePath(glob.trim());
}

function scopedFrontMatterKeys(content: string): Array<{ key: string; line: number }> {
  const lines = content.split('\\n');
  if (lines[0]?.trim() !== '---') return [];
  const keys: Array<{ key: string; line: number }> = [];
  for (const [index, line] of lines.entries()) {
    if (index > 0 && line.trim() === '---') break;
    const key = line.match(/^([A-Za-z][A-Za-z0-9_-]*):/)?.[1];
    if (key) keys.push({ key, line: index + 1 });
  }
  return keys;
}

function sectionName(value: string): string {
  return value || '(raiz)';
}

function addInvalid(invalidLines: InvalidLine[], file: string, line: number, section: string): void {
  invalidLines.push({ file, line, section: sectionName(section) });
}

function parseRoot(content: string, model: ClaudeModel): void {
  let section = '';
  for (const [index, line] of content.split('\n').entries()) {
    const number = index + 1;
    const trimmed = line.trim();
    if (trimmed === '' || trimmed === '<!-- nav:start -->' || trimmed === '<!-- nav:end -->' || trimmed === NAV_TEXT)
      continue;

    const heading = trimmed.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      section = heading[1] ?? '';
      if ((NAV_HEADINGS as readonly string[]).includes(section)) continue;
      addInvalid(model.invalidLines, 'CLAUDE.md', number, section);
      continue;
    }

    if (/^@\S+$/.test(trimmed)) {
      model.imports.push(normalizePath(trimmed.slice(1)));
      continue;
    }
    if (/^-\s+`[^`]+`\s+—\s+\S.*$/.test(trimmed)) {
      const reference = trimmed.match(/^-\s+`([^`]+)`\s+—\s+\S.*$/);
      const target = reference?.[1];
      if (target) model.onDemandRefs.push(normalizePath(target));
      continue;
    }
    addInvalid(model.invalidLines, 'CLAUDE.md', number, section);
  }
}

function parseScopedRule(path: string, content: string, model: ClaudeModel): void {
  const parsed = parseFrontMatter(path, content);
  for (const entry of scopedFrontMatterKeys(content)) {
    if (entry.key !== 'paths') addInvalid(model.invalidLines, path, entry.line, '(front matter)');
  }
  for (const error of parsed.errors) {
    addInvalid(model.invalidLines, path, Number(error.message.match(/linha (\d+)/)?.[1] ?? 1), '(front matter)');
  }

  const globs = parsed.frontMatter.paths?.map(normalizeGlob) ?? [];
  const imports: string[] = [];
  const section = '';
  for (const [index, line] of parsed.body.split('\n').entries()) {
    const number = parsed.bodyStartLine + index;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^@\S+$/.test(trimmed)) {
      const target = trimmed.slice(1);
      if (target.startsWith('.kiro/')) {
        addInvalid(model.invalidLines, path, number, section);
        continue;
      }
      imports.push(normalizePath(posix.join(posix.dirname(path), target)));
      continue;
    }
    addInvalid(model.invalidLines, path, number, section);
  }

  if (parsed.frontMatter.paths === undefined || globs.length === 0) {
    addInvalid(model.invalidLines, path, 1, '(front matter)');
  }
  model.scopedRules.push({ path, globs, imports });
}

/** Lê CLAUDE.md e as regras escopadas sem depender de arquivos reais fora do snapshot. */
export function parseClaudeModel(snap: RepoSnapshot): ClaudeModel {
  const model: ClaudeModel = { imports: [], onDemandRefs: [], scopedRules: [], invalidLines: [] };
  const claude = snap.files.get('CLAUDE.md');
  if (claude !== undefined) parseRoot(claude, model);

  for (const path of snap.paths.filter((candidate) => /^\.claude\/rules\/[^/]+\.md$/.test(candidate)).sort()) {
    parseScopedRule(path, snap.files.get(path) ?? '', model);
  }
  return model;
}

export function normalizeClaudePath(path: string): string {
  return normalizePath(path);
}

export function normalizeClaudeGlobs(globs: readonly string[]): string[] {
  return [...new Set(globs.map(normalizeGlob))].sort();
}
