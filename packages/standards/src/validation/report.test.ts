import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { commandsFor, type StackId } from './stacks.ts';
import { report } from './report.ts';

describe('commandsFor', () => {
  it('retorna comandos das stacks JavaScript e Python', () => {
    expect(commandsFor('standards').lint).toEqual(['pnpm', '--filter', '@nuagehub/standards', 'lint']);
    expect(commandsFor('api').test).toEqual(['pnpm', '--filter', '@nuagehub/api', 'test']);
    expect(commandsFor('ai:example')).toMatchObject({
      cwd: 'services/ai/example',
      typecheck: ['uv', 'run', 'mypy', '--config-file', '../../../mypy.ini', 'src'],
    });
  });
});

describe('report', () => {
  const stackArbitrary = fc.constantFrom<StackId>('web', 'api', 'standards', 'contracts', 'ai:example');
  const resultArbitrary = fc.record({
    stack: stackArbitrary,
    check: fc.constantFrom('lint', 'typecheck', 'test'),
    output: fc.array(fc.string(), { maxLength: 60 }).map((lines) => lines.join('\n')),
    ok: fc.boolean(),
  });

  // Feature: project-standards, Property 13: Relatório da validação
  it('retorna código 2 exatamente quando há falha e limita a saída a 40 linhas', () => {
    fc.assert(
      fc.property(fc.array(resultArbitrary, { maxLength: 8 }), (results) => {
        const summary = report(results);
        const failures = results.filter((result) => !result.ok);
        expect(summary.exitCode).toBe(failures.length > 0 ? 2 : 0);
        for (const failure of failures) {
          const rendered = `${failure.stack}] ${failure.check}: falhou`;
          expect(summary.message).toContain(rendered);
          const tail = (failure.output ?? '').split(/\r?\n/).slice(-40).join('\n');
          if (tail) expect(summary.message).toContain(tail);
        }
      }),
      { numRuns: 100 },
    );
  });
});
