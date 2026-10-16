import type { RepoSnapshot } from '../core/types.ts';
import { toPosix } from '../core/paths.ts';
import { parseFrontMatter, type SteeringFrontMatter } from './front-matter.ts';

export type InclusionMode = 'always' | 'auto' | 'fileMatch' | 'manual';
export type SteeringFolder = 'always' | 'auto' | 'conditional' | 'manual' | null;

export interface SteeringFile {
  path: string;
  folder: SteeringFolder;
  frontMatter: SteeringFrontMatter;
  pointerTarget?: string;
  lastModified?: string;
}

export const EXPECTED_MODE: Record<Exclude<SteeringFolder, null>, InclusionMode> = {
  always: 'always',
  auto: 'auto',
  conditional: 'fileMatch',
  manual: 'manual',
};

export function effectiveMode(file: SteeringFile): InclusionMode {
  return (file.frontMatter.inclusion as InclusionMode | undefined) ?? 'always';
}

export function steeringFolder(path: string): SteeringFolder {
  const parts = toPosix(path).split('/');
  const index = parts.indexOf('steering');
  const folder = index >= 0 ? parts[index + 1] : undefined;
  return folder === 'always' || folder === 'auto' || folder === 'conditional' || folder === 'manual' ? folder : null;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function extractLastModified(content: string): string | undefined {
  const match = content.match(/^\s*>?\s*Última alteração:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
  const value = match?.[1];
  return value && validDate(value) ? value : undefined;
}

function normalizeTarget(target: string): string {
  return toPosix(target.trim()).replace(/^\.\//, '');
}

/** Corpo sem a linha de data do cabeçalho (Req. 1.5), usado para reconhecer ponteiros. */
function pointerBody(body: string): string {
  return body
    .split(/\r?\n/)
    .filter((line) => !/^>?\s*Última alteração:\s*\d{4}-\d{2}-\d{2}\s*$/.test(line.trim()))
    .join('\n')
    .trim();
}

export function loadSteeringFiles(snap: RepoSnapshot): SteeringFile[] {
  return snap.paths
    .filter((path) => path.startsWith('.kiro/steering/') && path.endsWith('.md'))
    .sort()
    .map((path) => {
      const content = snap.files.get(path) ?? '';
      const parsed = parseFrontMatter(path, content);
      const pointer = pointerBody(parsed.body).match(/^#\[\[file:([^\]]+)\]\]$/);
      return {
        path,
        folder: steeringFolder(path),
        frontMatter: parsed.frontMatter,
        ...(pointer?.[1] ? { pointerTarget: normalizeTarget(pointer[1]) } : {}),
        ...(extractLastModified(content) ? { lastModified: extractLastModified(content) } : {}),
      };
    });
}

export function normalizeSteeringPath(path: string): string {
  return normalizeTarget(path);
}
