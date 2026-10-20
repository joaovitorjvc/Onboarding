import { parseDocument } from 'yaml';
import type { Violation } from '../core/types.ts';

export interface SteeringFrontMatter {
  inclusion?: string;
  name?: string;
  description?: string;
  fileMatchPattern?: string | string[];
  paths?: string[];
}

export interface FrontMatterResult {
  frontMatter: SteeringFrontMatter;
  body: string;
  bodyStartLine: number;
  errors: Violation[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStrings(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return undefined;
  return value as string[];
}

function lineOfYamlError(error: { linePos?: Array<{ line?: number }> }): number {
  const line = error.linePos?.[0]?.line;
  return typeof line === 'number' ? line + 2 : 2;
}

/** Analisa o bloco YAML inicial, sem interromper as demais checagens em caso de erro. */
export function parseFrontMatter(file: string, content: string): FrontMatterResult {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') {
    return { frontMatter: {}, body: content, bodyStartLine: 1, errors: [] };
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end === -1) {
    return {
      frontMatter: {},
      body: '',
      bodyStartLine: lines.length + 1,
      errors: [{ file, requirement: '2.6', message: `${file}: YAML sem delimitador de fechamento na linha 1` }],
    };
  }

  const yamlText = lines.slice(1, end).join('\n');
  const document = parseDocument(yamlText, { prettyErrors: false });
  const errors: Violation[] = document.errors.map((error) => ({
    file,
    requirement: '2.6',
    message: `${file}: YAML inválido na linha ${lineOfYamlError(error)}: ${error.message}`,
  }));
  const values = asRecord(document.toJS());
  const frontMatter: SteeringFrontMatter = {
    inclusion: asString(values.inclusion),
    name: asString(values.name),
    description: asString(values.description),
    fileMatchPattern: asString(values.fileMatchPattern) ?? asStrings(values.fileMatchPattern),
    paths: asStrings(values.paths),
  };

  return {
    frontMatter,
    body: lines.slice(end + 1).join('\n'),
    bodyStartLine: end + 2,
    errors,
  };
}
