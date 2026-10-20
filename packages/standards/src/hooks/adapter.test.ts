import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { normalizeStop, normalizeWrite, type HookSource, type WriteEvent } from './adapter.ts';
import {
  editOperationArbitrary,
  insertOperationArbitrary,
  safeContentArbitrary,
} from '../../test/arbitraries/hook-payloads.ts';

const fixtureDirectory = fileURLToPath(new URL('../../test/fixtures/hooks/', import.meta.url));
const repoRoot = '/tmp/nuagehub-project';

function fixture(name: string): Record<string, unknown> {
  const source = readFileSync(join(fixtureDirectory, name), 'utf8');
  return JSON.parse(source.replaceAll('/workspace/project', repoRoot)) as Record<string, unknown>;
}

function normalize(name: string, source: HookSource, files: Record<string, string> = {}): WriteEvent {
  return normalizeWrite(fixture(name), source, (path) => files[path] ?? null, repoRoot);
}

describe('adaptador de hooks', () => {
  it.each([
    ['kiro-preToolUse-write-create.json', 'kiro', 'tmp-hook/probe.txt', 'linha1'],
    ['kiro-preToolUse-write-strReplace.json', 'kiro', 'tmp-hook/probe.txt', 'linha1-editada'],
    ['kiro-preToolUse-write-insert.json', 'kiro', 'tmp-hook/probe.txt', 'linha1-editada\nlinha2'],
    ['claude-PreToolUse-Write.json', 'claude', 'tmp-hook/claude.txt', 'linha1'],
    ['claude-PreToolUse-Edit.json', 'claude', 'tmp-hook/claude.txt', 'linha1-editada'],
    ['claude-PreToolUse-Edit-append.json', 'claude', 'tmp-hook/claude.txt', 'linha1-final\nlinha2'],
  ] as const)('normaliza a fixture %s', (name, source, filePath, content) => {
    const files = name.includes('strReplace')
      ? { [filePath]: 'linha1' }
      : name.includes('Edit')
        ? { [filePath]: 'linha1-final' }
        : name.includes('insert')
          ? { [filePath]: 'linha1-editada' }
          : {};
    const event = normalize(name, source, files);
    expect(event.filePath).toBe(filePath);
    expect(event.content).toBe(content);
  });

  it('normaliza todas as fixtures de parada e preserva a reentrada', () => {
    expect(normalizeStop(fixture('kiro-stop.json'), 'kiro')).toEqual({ source: 'kiro', reentrant: false });
    expect(normalizeStop(fixture('claude-Stop.json'), 'claude')).toEqual({ source: 'claude', reentrant: false });
    expect(normalizeStop({ hook_event_name: 'Stop', stop_hook_active: true }, 'claude')).toEqual({
      source: 'claude',
      reentrant: true,
    });
  });

  it('aplica MultiEdit Claude em sequência e respeita replace_all', () => {
    const event = normalizeWrite(
      {
        cwd: repoRoot,
        tool_name: 'MultiEdit',
        tool_input: {
          file_path: `${repoRoot}/arquivo.txt`,
          edits: [
            { old_string: 'a', new_string: 'b', replace_all: true },
            { old_string: 'b', new_string: 'c', replace_all: false },
          ],
        },
      },
      'claude',
      (path) => (path === 'arquivo.txt' ? 'a-a' : null),
      repoRoot,
    );
    expect(event).toEqual({ source: 'claude', toolName: 'MultiEdit', filePath: 'arquivo.txt', content: 'c-b' });
  });

  // Feature: project-standards, Property 7: Normalização de escrita reconstrói o conteúdo final
  it('reconstrói operações Kiro para qualquer conteúdo e operação válida', () => {
    const operationArbitrary = fc.oneof(
      fc.record({ kind: fc.constant('create' as const), content: safeContentArbitrary }),
      fc.record({ kind: fc.constant('replace' as const), operation: editOperationArbitrary }),
      fc.record({ kind: fc.constant('insert' as const), operation: insertOperationArbitrary }),
    );
    fc.assert(
      fc.property(safeContentArbitrary, operationArbitrary, (base, operation) => {
        const files: Record<string, string> = { 'arquivo.txt': base };
        let payload: Record<string, unknown>;
        let expected: string;
        if (operation.kind === 'create') {
          payload = {
            tool_name: 'write',
            cwd: repoRoot,
            tool_input: { command: 'create', path: 'arquivo.txt', content: operation.content },
          };
          expected = operation.content;
        } else if (operation.kind === 'replace') {
          const { oldValue, newValue, replaceAll } = operation.operation;
          payload = {
            tool_name: 'write',
            cwd: repoRoot,
            tool_input: { command: 'strReplace', path: 'arquivo.txt', oldStr: oldValue, newStr: newValue, replaceAll },
          };
          expected = base.includes(oldValue)
            ? replaceAll
              ? base.split(oldValue).join(newValue)
              : base.replace(oldValue, newValue)
            : newValue;
        } else {
          const { content, insertLine } = operation.operation;
          payload = {
            tool_name: 'write',
            cwd: repoRoot,
            tool_input: { command: 'insert', path: 'arquivo.txt', content },
          };
          if (insertLine !== undefined) payload.tool_input = { ...(payload.tool_input as object), insertLine };
          if (insertLine === undefined) expected = base.endsWith('\n') ? `${base}${content}` : `${base}\n${content}`;
          else {
            const lines = base.split('\n');
            lines.splice(Math.min(insertLine, lines.length), 0, content);
            expected = lines.join('\n');
          }
        }
        const event = normalizeWrite(payload, 'kiro', (path) => files[path] ?? null, repoRoot);
        expect(event.filePath).toBe('arquivo.txt');
        expect(event.content).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });
});
