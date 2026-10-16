import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { createRequire } from 'node:module';
import type { PageContent } from '@nuagehub/contracts';

const nodeRequire = createRequire(__filename);

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

function duplicateChecklistIds(page: PageContent): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const block of page.blocks) {
    if (block.type !== 'checklist') continue;
    for (const item of block.items) {
      if (seen.has(item.id)) duplicates.add(item.id);
      seen.add(item.id);
    }
  }
  return [...duplicates].sort();
}

function schemaPath(): string {
  try {
    return nodeRequire.resolve('@nuagehub/contracts/schemas/page-content.schema.json');
  } catch {
    const entry = nodeRequire.resolve('@nuagehub/contracts');
    return resolve(entry, '..', '..', 'schemas', 'page-content.schema.json');
  }
}

function readSchema(): Record<string, unknown> {
  return JSON.parse(readFileSync(schemaPath(), 'utf8')) as Record<string, unknown>;
}

function validationMessage(filePath: string, error: ErrorObject): string {
  const instancePath = error.instancePath || '/';
  const missingProperty =
    error.keyword === 'required' && typeof error.params === 'object' && error.params !== null
      ? (error.params as { missingProperty?: unknown }).missingProperty
      : undefined;
  const fieldPath =
    typeof missingProperty === 'string'
      ? `${instancePath === '/' ? '' : instancePath}/${missingProperty}`
      : instancePath;
  return `${filePath}: ${fieldPath} ${error.message ?? 'conteúdo inválido'}`;
}

function createValidator(): ValidateFunction {
  const ajv = new Ajv2020({ strict: true, strictRequired: false, strictTypes: false, allErrors: true });
  addFormats(ajv);
  return ajv.compile(readSchema());
}

function parseFile(filePath: string, validate: ValidateFunction): PageContent {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON inválido.';
    throw new ContentValidationError(`${filePath}: / ${message}`);
  }

  if (!validate(value)) {
    const firstError = validate.errors?.[0];
    throw new ContentValidationError(
      firstError ? validationMessage(filePath, firstError) : `${filePath}: / conteúdo inválido`,
    );
  }

  const page = value as PageContent;
  const expectedSlug = basename(filePath, extname(filePath));
  if (page.slug !== expectedSlug) {
    throw new ContentValidationError(`${filePath}: /slug deve ser igual ao nome do arquivo (${expectedSlug})`);
  }
  const duplicates = duplicateChecklistIds(page);
  if (duplicates.length > 0) {
    throw new ContentValidationError(`${filePath}: /blocks IDs de checklist duplicados: ${duplicates.join(', ')}`);
  }
  return page;
}

function jsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith('.json') ? [entryPath] : [];
  });
}

export function loadPages(directory = join(__dirname, 'data')): PageContent[] {
  const validate = createValidator();
  let filePaths: string[];
  try {
    filePaths = jsonFiles(directory).sort();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'diretório de conteúdo indisponível';
    throw new ContentValidationError(`${directory}: / ${message}`);
  }

  const pages = filePaths.map((filePath) => parseFile(filePath, validate));
  const seen = new Map<string, string>();
  for (const [index, page] of pages.entries()) {
    const filePath = filePaths[index] ?? '<arquivo desconhecido>';
    const previousFile = seen.get(page.slug);
    if (previousFile) {
      throw new ContentValidationError(`${filePath}: /slug duplicado; também presente em ${previousFile}`);
    }
    seen.set(page.slug, filePath);
  }
  return pages;
}
