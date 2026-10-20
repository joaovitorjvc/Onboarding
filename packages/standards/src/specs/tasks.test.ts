import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { findGraphIssues, formatTasks, parseTasks, type Task } from './tasks.ts';
import { graphArb, validTasksArb } from '../../test/arbitraries/tasks.ts';

const REAL_TASKS = fileURLToPath(new URL('../../../../.kiro/specs/project-standards/tasks.md', import.meta.url));

/** Modelo de referência: algoritmo de Kahn sobre as arestas para tarefas existentes. */
function kahnHasOrder(tasks: readonly Task[]): boolean {
  const ids = new Set(tasks.map((t) => t.id));
  const indegree = new Map(tasks.map((t) => [t.id, t.dependsOn.filter((d) => ids.has(d)).length]));
  const queue = tasks.filter((t) => indegree.get(t.id) === 0).map((t) => t.id);
  let seen = 0;
  while (queue.length > 0) {
    const id = queue.shift() as string;
    seen += 1;
    for (const t of tasks) {
      if (t.dependsOn.includes(id)) {
        const n = (indegree.get(t.id) ?? 0) - 1;
        indegree.set(t.id, n);
        if (n === 0) queue.push(t.id);
      }
    }
  }
  return seen === tasks.length;
}

describe('parseTasks', () => {
  it('lê o tasks.md real do repositório sem erros', () => {
    const { tasks, errors } = parseTasks(readFileSync(REAL_TASKS, 'utf8'));
    expect(errors).toEqual([]);
    expect(tasks.length).toBe(74);
    const t11 = tasks.find((t) => t.id === '1.1');
    expect(t11?.stack).toBe('repo');
    const t34 = tasks.find((t) => t.id === '3.4');
    expect(t34?.optional).toBe(true);
    expect(t34?.requirements).toEqual(['12.5']);
    expect(findGraphIssues(tasks)).toEqual({ missing: [], cycles: [] });
  });

  it('ignora agrupadores e checkpoints de primeiro nível', () => {
    const md = [
      '- [ ] 2. Checkpoint',
      '  - Rodar testes.',
      '- [ ] 3. Grupo',
      '  - [ ] 3.1 Tarefa',
      '    - _Requirements: 1.1_',
      '    - _Depends: -_',
      '    - _Stack: repo · Est: 1h_',
    ].join('\n');
    const { tasks, errors } = parseTasks(md);
    expect(errors).toEqual([]);
    expect(tasks.map((t) => t.id)).toEqual(['3.1']);
  });

  it('reporta metadados ausentes ou malformados', () => {
    const md = ['- [ ] 3.1 Sem requisitos', '  - _Depends: x_', '  - _Stack: repo · Est: 1h_'].join('\n');
    const messages = parseTasks(md).errors.map((e) => e.message);
    expect(messages.some((m) => m.includes('sem requisitos'))).toBe(true);
    expect(messages.some((m) => m.includes('_Depends malformado'))).toBe(true);
  });

  // Feature: project-standards, Property 16: Round-trip do formato de tarefas
  it('Property 16: formatTasks seguido de parseTasks preserva as tarefas', () => {
    fc.assert(
      fc.property(validTasksArb, (tasks) => {
        const parsed = parseTasks(formatTasks(tasks));
        expect(parsed.errors).toEqual([]);
        expect(parsed.tasks.map(({ line: _line, ...rest }) => rest)).toEqual(tasks);
      }),
      { numRuns: 100 },
    );
  });
});

describe('findGraphIssues', () => {
  // Feature: project-standards, Property 17: Detecção de dependências inválidas e ciclos
  it('Property 17: missing exato e ciclo se e somente se não houver ordem topológica', () => {
    fc.assert(
      fc.property(graphArb, (tasks) => {
        const ids = new Set(tasks.map((t) => t.id));
        const expectedMissing = tasks.flatMap((t) => t.dependsOn.filter((d) => !ids.has(d)).map((d) => [t.id, d]));
        const { missing, cycles } = findGraphIssues(tasks);
        expect([...missing].sort()).toEqual([...expectedMissing].sort());
        expect(cycles.length > 0).toBe(!kahnHasOrder(tasks));
        const byId = new Map(tasks.map((t) => [t.id, t]));
        for (const cycle of cycles) {
          // Ciclo real: cada nó depende do seguinte e fecha no primeiro.
          expect(cycle[0]).toBe(cycle[cycle.length - 1]);
          for (let i = 0; i < cycle.length - 1; i++) {
            expect(byId.get(cycle[i] as string)?.dependsOn).toContain(cycle[i + 1]);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
