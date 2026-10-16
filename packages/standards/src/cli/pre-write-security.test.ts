import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { processFiles, processWrite } from './pre-write-security.ts';
import { malformedPayloadArbitrary } from '../../test/arbitraries/hook-payloads.ts';

const repoRoot = process.cwd().endsWith('/packages/standards') ? join(process.cwd(), '../..') : process.cwd();

describe('CLI pre-write-security', () => {
  it('permite uma escrita segura', () => {
    const result = processWrite(
      {
        hook_event_name: 'preToolUse',
        cwd: repoRoot,
        tool_name: 'write',
        tool_input: { command: 'create', path: 'arquivo-seguro.txt', content: 'conteúdo seguro' },
      },
      'kiro',
      { repoRoot },
    );
    expect(result).toEqual({ exitCode: 0, stdout: '', stderr: '' });
  });

  it('bloqueia um achado crítico e pede confirmação para alerta', () => {
    const secret = ['AK', 'IA', '1234567890ABCDEF'].join('');
    const blocked = processWrite(
      {
        cwd: repoRoot,
        tool_name: 'write',
        tool_input: { command: 'create', path: 'arquivo.ts', content: `const token = '${secret}';` },
      },
      'kiro',
      { repoRoot },
    );
    expect(blocked.exitCode).toBe(2);
    expect(blocked.stderr).toContain('[hardcoded-secret]');

    const alert = ['rejectUnauthorized', ': false'].join('');
    const asked = processWrite(
      { cwd: repoRoot, tool_name: 'Write', tool_input: { file_path: join(repoRoot, 'arquivo.ts'), content: alert } },
      'claude',
      { repoRoot },
    );
    expect(asked.exitCode).toBe(0);
    expect(JSON.parse(asked.stdout).hookSpecificOutput.permissionDecision).toBe('ask');
  });

  it('transforma falhas internas em confirmação e aplica o watchdog', () => {
    const raw = {
      cwd: repoRoot,
      tool_name: 'write',
      tool_input: { command: 'create', path: 'arquivo.ts', content: 'seguro' },
    };
    const failed = processWrite(raw, 'claude', {
      repoRoot,
      scan: () => {
        throw new Error('falha simulada');
      },
    });
    expect(JSON.parse(failed.stdout).hookSpecificOutput.permissionDecisionReason).toContain('falha simulada');
    const timeout = processWrite(raw, 'kiro', {
      repoRoot,
      now: (() => {
        let count = 0;
        return () => ((count += 1) === 1 ? 0 : 4001);
      })(),
    });
    expect(timeout.stderr).toContain('scan-timeout');
  });

  // Feature: project-standards, Property 10: Payload malformado vira confirmação
  it('converte qualquer payload que não seja uma escrita reconhecível em ask', () => {
    fc.assert(
      fc.property(malformedPayloadArbitrary, (payload) => {
        const result = processWrite(payload, 'claude', { repoRoot });
        expect(result.exitCode).toBe(0);
        const output = JSON.parse(result.stdout) as { hookSpecificOutput: { permissionDecision: string } };
        expect(output.hookSpecificOutput.permissionDecision).toBe('ask');
      }),
      { numRuns: 100 },
    );
  });

  it('varre arquivos no modo CI e emite anotações para alertas', () => {
    const result = processFiles(['packages/standards/test/fixtures/hooks/kiro-stop.json'], repoRoot);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('executa o shim de ponta a ponta com uma fixture via stdin', () => {
    const fixture = readFileSync(
      join(repoRoot, 'packages/standards/test/fixtures/hooks/kiro-preToolUse-write-create.json'),
      'utf8',
    ).replaceAll('/workspace/project', repoRoot);
    const output = execFileSync(join(repoRoot, 'scripts/hooks/pre-write-security'), ['--source', 'kiro'], {
      cwd: repoRoot,
      input: fixture,
      encoding: 'utf8',
    });
    expect(output).toBe('');
  });
});
