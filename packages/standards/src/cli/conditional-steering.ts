#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import picomatch from 'picomatch';
import { parse as parseYaml } from 'yaml';

interface FrontMatter {
  inclusion?: string;
  fileMatchPattern?: string | string[];
}

interface ConditionalFile {
  path: string;
  name: string;
  body: string;
  patterns: string[];
}

function findMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findMarkdownFiles(path) : entry.name.endsWith('.md') ? [path] : [];
  });
}

function parseConditionalFile(root: string, path: string): ConditionalFile {
  const source = readFileSync(path, 'utf8');
  if (!source.startsWith('---')) throw new Error(`front matter ausente em ${relative(root, path)}`);
  const end = source.indexOf('\n---', 3);
  if (end < 0) throw new Error(`front matter não terminado em ${relative(root, path)}`);
  const frontMatter = parseYaml(source.slice(3, end)) as FrontMatter | null;
  const patterns = frontMatter?.fileMatchPattern;
  if (frontMatter?.inclusion !== 'fileMatch' || (!patterns && patterns !== '')) {
    throw new Error(`front matter inválido em ${relative(root, path)}`);
  }
  const normalized = (Array.isArray(patterns) ? patterns : [patterns]).filter(
    (pattern): pattern is string => typeof pattern === 'string',
  );
  if (normalized.length === 0) throw new Error(`fileMatchPattern ausente em ${relative(root, path)}`);
  return {
    path,
    name: basename(path),
    body: source.slice(end + '\n---'.length).replace(/^\n/, ''),
    patterns: normalized,
  };
}

function baseDirectory(pattern: string): string {
  const wildcard = pattern.search(/[*!?[{]/);
  const prefix = wildcard < 0 ? pattern : pattern.slice(0, wildcard);
  return prefix.replace(/\/+$/, '');
}

export function renderConditionalSteering(root: string, prompt: string, changedFiles: readonly string[]): string {
  const directory = join(root, '.kiro', 'steering', 'conditional');
  const files = findMarkdownFiles(directory).sort();
  const changed = changedFiles.map((file) => file.replaceAll('\\', '/'));
  const selected = files
    .map((file) => parseConditionalFile(root, file))
    .filter((file) => {
      const matcher = picomatch(file.patterns, { dot: true });
      return file.patterns.some(
        (pattern) => changed.some((path) => matcher(path)) || prompt.includes(baseDirectory(pattern)),
      );
    });
  return selected.map((file) => `## Steering condicional: ${file.name}\n${file.body.trimEnd()}`).join('\n\n');
}

function changedFiles(root: string): string[] {
  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
    });
    return [...new Set(`${output}\n${untracked}`.split(/\r?\n/).filter(Boolean))];
  } catch {
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .filter(Boolean);
  }
}

function main(): void {
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    const input = JSON.parse(readFileSync(0, 'utf8')) as { prompt?: unknown };
    const prompt = typeof input.prompt === 'string' ? input.prompt : '';
    const output = renderConditionalSteering(root, prompt, changedFiles(root));
    if (output) process.stdout.write(`${output}\n`);
  } catch (error) {
    process.stderr.write(`conditional-steering: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 0;
  }
}

if (import.meta.main) main();
