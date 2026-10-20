import { parseTasks, findGraphIssues } from '../specs/tasks.ts';
import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

function taskFiles(snap: RepoSnapshot): string[] {
  return snap.paths.filter((path) => path.startsWith('.kiro/specs/') && path.endsWith('/tasks.md')).sort();
}

/** Valida tarefas atômicas e suas dependências no formato da Spec. */
export const tasksGraphCheck: NamedCheck = {
  name: 'tasks-graph-check',
  run: (snap: RepoSnapshot): Violation[] => {
    const violations: Violation[] = [];
    for (const file of taskFiles(snap)) {
      const content = snap.files.get(file);
      if (content === undefined) continue;
      const parsed = parseTasks(content);
      for (const parseError of parsed.errors) violations.push({ ...parseError, file });
      for (const task of parsed.tasks) {
        const location = `${file} (tarefa ${task.id})`;
        if (
          task.requirements.length === 0 &&
          !parsed.errors.some((item) => item.message.includes(`tarefa ${task.id} sem requisitos`))
        ) {
          violations.push({ file, requirement: '6.13', message: `${location} não declara requisitos` });
        }
        if (!Number.isFinite(task.hours) || task.hours < 0) {
          if (!parsed.errors.some((item) => item.message.includes(`tarefa ${task.id} sem metadado _Stack`))) {
            violations.push({ file, requirement: '6.13', message: `${location} tem Est malformada` });
          }
        } else if (task.hours > snap.config.taskMaxHours) {
          violations.push({
            file,
            requirement: '6.13',
            message: `${location} excede o limite de ${snap.config.taskMaxHours}h com ${task.hours}h`,
          });
        }
        if (task.stack.includes(',')) {
          violations.push({
            file,
            requirement: '6.13',
            message: `${location} declara mais de uma Stack_Afetada: ${task.stack}`,
          });
        }
      }
      const graph = findGraphIssues(parsed.tasks);
      for (const [from, to] of graph.missing) {
        violations.push({ file, requirement: '6.14', message: `a tarefa ${from} depende da tarefa inexistente ${to}` });
      }
      for (const cycle of graph.cycles) {
        violations.push({
          file,
          requirement: '6.14',
          message: `ciclo de dependências detectado: ${cycle.join(' → ')}`,
        });
      }
    }
    return violations;
  },
};
