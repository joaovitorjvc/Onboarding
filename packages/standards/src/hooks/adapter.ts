import { isAbsolute, relative, resolve } from 'node:path';

export type HookSource = 'kiro' | 'claude' | 'cli';

export interface WriteEvent {
  source: HookSource;
  toolName: string;
  filePath: string;
  content: string;
}

export interface StopEvent {
  source: HookSource;
  reentrant: boolean;
}

export class AdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterError';
  }
}

type ReadFile = (path: string) => string | null;
type RecordValue = Record<string, unknown>;

function asRecord(value: unknown, label: string): RecordValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AdapterError(`payload ${label} inválido`);
  }
  return value as RecordValue;
}

function firstString(record: RecordValue, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function inputOf(raw: RecordValue): RecordValue {
  const input = raw.tool_input ?? raw.toolInput ?? raw.input ?? raw.arguments;
  return asRecord(input, 'tool_input');
}

function normalizePath(raw: RecordValue, input: RecordValue, repoRoot: string): string {
  const pathValue = firstString(input, ['file_path', 'path', 'targetFile', 'filePath']);
  if (!pathValue) throw new AdapterError('payload sem caminho do arquivo');
  const cwd = firstString(raw, ['cwd']) ?? repoRoot;
  const absolutePath = isAbsolute(pathValue) ? resolve(pathValue) : resolve(cwd, pathValue);
  const relativePath = relative(resolve(repoRoot), absolutePath).replace(/\\/g, '/');
  if (!relativePath || relativePath === '..' || relativePath.startsWith('../')) {
    throw new AdapterError('caminho do arquivo fora da raiz do repositório');
  }
  return relativePath;
}

function existingContent(readFile: ReadFile, filePath: string): string | null {
  const value = readFile(filePath);
  return typeof value === 'string' ? value : null;
}

function replacementResult(current: string | null, oldValue: string, newValue: string, replaceAll: boolean): string {
  if (current === null || !current.includes(oldValue)) return newValue;
  if (replaceAll) return current.split(oldValue).join(newValue);
  return current.replace(oldValue, newValue);
}

function appendResult(current: string | null, content: string): string {
  if (current === null || current.length === 0) return content;
  return `${current.endsWith('\n') ? current : `${current}\n`}${content}`;
}

function insertResult(current: string | null, content: string, insertLine: number | undefined): string {
  if (insertLine === undefined) return appendResult(current, content);
  if (!Number.isInteger(insertLine) || insertLine < 0) {
    throw new AdapterError('insertLine deve ser um índice inteiro não negativo');
  }
  if (current === null || current.length === 0) return content;
  const lines = current.split('\n');
  const index = Math.min(insertLine, lines.length);
  lines.splice(index, 0, content);
  return lines.join('\n');
}

function applyEdit(current: string | null, edit: RecordValue): string {
  const oldValue = firstString(edit, ['old_string', 'oldStr']);
  const newValue = firstString(edit, ['new_string', 'newStr']);
  if (oldValue === undefined || newValue === undefined) {
    throw new AdapterError('edição sem old_string/oldStr ou new_string/newStr');
  }
  const replaceAll = edit.replace_all === true || edit.replaceAll === true;
  return replacementResult(current, oldValue, newValue, replaceAll);
}

function operationContent(raw: RecordValue, input: RecordValue, readFile: ReadFile, filePath: string): string {
  const toolName = (firstString(raw, ['tool_name', 'toolName']) ?? '').toLowerCase();
  const command = firstString(input, ['command'])?.toLowerCase();
  const current = existingContent(readFile, filePath);

  if (toolName === 'write' && command === 'create') {
    const content = input.content;
    if (typeof content !== 'string') throw new AdapterError('criação sem content');
    return content;
  }

  if (toolName === 'write' && command === 'insert') {
    const content = input.content;
    if (typeof content !== 'string') throw new AdapterError('inserção sem content');
    const rawInsertLine = input.insertLine;
    const insertLine =
      rawInsertLine === undefined
        ? undefined
        : typeof rawInsertLine === 'number'
          ? rawInsertLine
          : (() => {
              throw new AdapterError('insertLine deve ser um número inteiro não negativo');
            })();
    return insertResult(current, content, insertLine);
  }

  if (toolName === 'write' && command === 'strreplace') return applyEdit(current, input);

  if (toolName === 'write' || toolName === 'edit') {
    if (typeof input.content === 'string' && toolName === 'write') return input.content;
    return applyEdit(current, input);
  }

  if (toolName === 'multiedit') {
    const edits = input.edits;
    if (!Array.isArray(edits)) throw new AdapterError('MultiEdit sem edits');
    let result = current;
    for (const edit of edits) result = applyEdit(result, asRecord(edit, 'edit'));
    return result ?? '';
  }

  throw new AdapterError(`ferramenta de escrita não reconhecida: ${toolName || 'ausente'}`);
}

/** Normaliza os payloads reais do Kiro e do Claude em um evento único. */
export function normalizeWrite(raw: unknown, source: HookSource, readFile: ReadFile, repoRoot: string): WriteEvent {
  const payload = asRecord(raw, 'hook');
  const input = inputOf(payload);
  const toolName = firstString(payload, ['tool_name', 'toolName']);
  if (!toolName) throw new AdapterError('payload sem nome da ferramenta');
  const filePath = normalizePath(payload, input, repoRoot);
  const content = operationContent(payload, input, readFile, filePath);
  return { source, toolName, filePath, content };
}

/** Normaliza o evento de parada e sinaliza reentrada do Claude Code. */
export function normalizeStop(raw: unknown, source: HookSource): StopEvent {
  const payload = asRecord(raw, 'stop');
  const value = payload.stop_hook_active ?? payload.stopHookActive;
  if (value !== undefined && typeof value !== 'boolean') {
    throw new AdapterError('stop_hook_active deve ser booleano');
  }
  return { source, reentrant: value === true };
}
