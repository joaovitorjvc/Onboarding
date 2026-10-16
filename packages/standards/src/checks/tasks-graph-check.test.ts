import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { tasksGraphCheck } from './tasks-graph-check.ts';

const file = '.kiro/specs/demo/tasks.md';
const task = (id: string, deps: string, stack = 'repo', est = '1') =>
  [
    `- [ ] ${id} Tarefa ${id}`,
    '  - _Requirements: 1.1_',
    `  - _Depends: ${deps}_`,
    `  - _Stack: ${stack} · Est: ${est}h_`,
  ].join('\n');

describe('tasksGraphCheck', () => {
  it('aceita grafo válido', () => {
    const md = [task('1.1', '-'), task('1.2', '1.1')].join('\n');
    expect(tasksGraphCheck.run(snapshotFrom({ [file]: md }))).toEqual([]);
  });

  it('reporta estimativa acima de 8 h, várias stacks, dependência inexistente e ciclo', () => {
    const md = [task('1.1', '1.3', 'web, api', '9'), task('1.2', '9.9'), task('1.3', '1.1')].join('\n');
    const messages = tasksGraphCheck.run(snapshotFrom({ [file]: md })).map((v) => `${v.requirement} ${v.message}`);
    expect(messages.some((m) => m.startsWith('6.13') && m.includes('excede o limite de 8h'))).toBe(true);
    expect(messages.some((m) => m.startsWith('6.13') && m.includes('mais de uma Stack_Afetada'))).toBe(true);
    expect(messages.some((m) => m.startsWith('6.14') && m.includes('inexistente 9.9'))).toBe(true);
    expect(messages.some((m) => m.startsWith('6.14') && m.includes('ciclo'))).toBe(true);
  });
});
