// Geradores de tarefas atômicas e grafos de dependência (Properties 16 e 17).
import fc from 'fast-check';
import type { Task } from '../../src/specs/tasks.ts';

export const taskIdArb = fc
  .tuple(fc.integer({ min: 1, max: 30 }), fc.integer({ min: 1, max: 30 }))
  .map(([a, b]) => `${a}.${b}`);

const textArb = fc
  .array(fc.constantFrom('criar', 'teste', 'módulo', 'api', 'web', 'arquivo', 'config', 'x1'), {
    minLength: 1,
    maxLength: 6,
  })
  .map((words) => words.join(' '));

const requirementArb = fc
  .tuple(fc.integer({ min: 1, max: 18 }), fc.integer({ min: 1, max: 17 }))
  .map(([a, b]) => `${a}.${b}`);

const stackArb = fc.constantFrom('repo', 'standards', 'contracts', 'web', 'api', 'ai:example');
const hoursArb = fc.constantFrom(0.25, 0.5, 0.75, 1, 1.5, 2, 3, 8);

/** Lista válida de tarefas com ids únicos; dependências apontam só para tarefas anteriores. */
export const validTasksArb: fc.Arbitrary<Task[]> = fc
  .uniqueArray(taskIdArb, { minLength: 1, maxLength: 12 })
  .chain((ids) =>
    fc.tuple(
      ...ids.map((id, index) =>
        fc.record({
          id: fc.constant(id),
          title: textArb,
          done: fc.boolean(),
          optional: fc.boolean(),
          details: fc.array(textArb, { maxLength: 3 }),
          requirements: fc.uniqueArray(requirementArb, { minLength: 1, maxLength: 4 }),
          dependsOn: fc.uniqueArray(fc.constantFrom(...(index === 0 ? ['__none__'] : ids.slice(0, index))), {
            maxLength: 3,
          }),
          stack: stackArb,
          hours: hoursArb,
        }),
      ),
    ),
  )
  .map((tasks) => tasks.map((t) => ({ ...t, dependsOn: t.dependsOn.filter((d) => d !== '__none__') })));

/** Grafo arbitrário: ids únicos e arestas para ids existentes ou inexistentes. */
export const graphArb = fc.uniqueArray(taskIdArb, { minLength: 1, maxLength: 10 }).chain((ids) =>
  fc
    .tuple(
      ...ids.map(() =>
        fc.uniqueArray(
          fc.oneof({ weight: 4, arbitrary: fc.constantFrom(...ids) }, { weight: 1, arbitrary: taskIdArb }),
          {
            maxLength: 3,
          },
        ),
      ),
    )
    .map((deps) =>
      ids.map((id, i): Task => ({
        id,
        title: 't',
        done: false,
        optional: false,
        details: [],
        requirements: ['1.1'],
        dependsOn: deps[i] ?? [],
        stack: 'repo',
        hours: 1,
      })),
    ),
);
