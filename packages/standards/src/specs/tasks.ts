import type { Violation } from '../core/types.ts';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  optional: boolean;
  details: string[];
  requirements: string[];
  dependsOn: string[];
  stack: string;
  hours: number;
  line?: number;
}

export interface ParsedTasks {
  tasks: Task[];
  errors: Violation[];
}

const ATOMIC_TASK = /^(\s*)-\s+\[([ xX])\](\*)?\s+(\d+\.\d+)\s+(.+?)\s*$/;
const CHECKLIST_ITEM = /^\s*-\s+\[[ xX]\](?:\*)?\s+\S+/;
const REQUIREMENTS = /^-\s+_Requirements:\s*(.*?)_\s*$/;
const VALIDATES = /^-\s+\*\*Validates:\s*Requirements\s+(.+?)\*\*\s*$/;
const DEPENDS = /^-\s+_Depends:\s*(.*?)_\s*$/;
const STACK = /^-\s+_Stack:\s*(.+?)\s+·\s+Est:\s*(\d+(?:\.\d+)?)h_\s*$/;
const TASK_ID = /^\d+\.\d+$/;

function error(message: string, line?: number): Violation {
  const suffix = line === undefined ? '' : ` (linha ${line})`;
  return { file: 'tasks.md', requirement: '6.13', message: `${message}${suffix}` };
}

function parseIds(value: string, label: string, line: number, errors: Violation[]): string[] {
  if (value.trim() === '-') return [];
  const ids = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (ids.length === 0 || ids.some((id) => !TASK_ID.test(id))) {
    errors.push(error(`${label} malformado: "${value}"`, line));
    return [];
  }
  return [...new Set(ids)];
}

function parseTaskBlock(
  lines: string[],
  start: number,
  end: number,
  match: RegExpMatchArray,
  errors: Violation[],
): Task {
  const id = match[4] ?? '';
  const title = (match[5] ?? '').trim();
  const task: Task = {
    id,
    title,
    done: (match[2] ?? '').toLowerCase() === 'x',
    optional: match[3] === '*',
    details: [],
    requirements: [],
    dependsOn: [],
    stack: '',
    hours: Number.NaN,
    line: start + 1,
  };
  let requirementsFound = false;
  let dependsFound = false;
  let stackFound = false;
  for (let index = start + 1; index < end; index += 1) {
    const trimmed = (lines[index] ?? '').trim();
    if (trimmed === '') continue;
    const requirementsMatch = REQUIREMENTS.exec(trimmed);
    const validatesMatch = VALIDATES.exec(trimmed);
    const dependsMatch = DEPENDS.exec(trimmed);
    const stackMatch = STACK.exec(trimmed);
    if (requirementsMatch !== null) {
      requirementsFound = true;
      task.requirements.push(...parseIds(requirementsMatch[1] ?? '', '_Requirements', index + 1, errors));
    } else if (validatesMatch !== null) {
      requirementsFound = true;
      task.requirements.push(...parseIds(validatesMatch[1] ?? '', 'Validates', index + 1, errors));
    } else if (dependsMatch !== null) {
      dependsFound = true;
      task.dependsOn.push(...parseIds(dependsMatch[1] ?? '', '_Depends', index + 1, errors));
    } else if (stackMatch !== null) {
      stackFound = true;
      task.stack = (stackMatch[1] ?? '').trim();
      task.hours = Number(stackMatch[2] ?? Number.NaN);
    } else if (/^-\s+_(Requirements|Depends|Stack):/.test(trimmed) || /^-\s+\*\*Validates:/.test(trimmed)) {
      errors.push(error(`metadado malformado na tarefa ${id}`, index + 1));
    } else if (trimmed.startsWith('- ')) {
      task.details.push(trimmed.slice(2).trim());
    } else {
      task.details.push(trimmed);
    }
  }
  task.requirements = [...new Set(task.requirements)];
  task.dependsOn = [...new Set(task.dependsOn)];
  if (!requirementsFound || task.requirements.length === 0)
    errors.push(error(`tarefa ${id} sem requisitos`, start + 1));
  if (!dependsFound) errors.push(error(`tarefa ${id} sem metadado _Depends`, start + 1));
  if (!stackFound) errors.push(error(`tarefa ${id} sem metadado _Stack`, start + 1));
  if (stackFound && task.stack.length === 0) errors.push(error(`tarefa ${id} sem Stack_Afetada`, start + 1));
  return task;
}

/** Faz o parse das tarefas atômicas, ignorando itens-pai e checkpoints de primeiro nível. */
export function parseTasks(markdown: string): ParsedTasks {
  const lines = markdown.split(/\r?\n/);
  const starts: { index: number; match: RegExpMatchArray }[] = [];
  const errors: Violation[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = ATOMIC_TASK.exec(lines[index] ?? '');
    if (match !== null) starts.push({ index, match });
  }
  const tasks: Task[] = [];
  for (let position = 0; position < starts.length; position += 1) {
    const current = starts[position];
    if (current === undefined) continue;
    const nextChecklist = lines.findIndex((line, index) => index > current.index && CHECKLIST_ITEM.test(line));
    const end = nextChecklist === -1 ? lines.length : nextChecklist;
    tasks.push(parseTaskBlock(lines, current.index, end, current.match, errors));
  }
  const seen = new Set<string>();
  for (const task of tasks) {
    if (seen.has(task.id)) errors.push(error(`identificador de tarefa duplicado: ${task.id}`, task.line));
    seen.add(task.id);
  }
  return { tasks, errors };
}

/** Formata tarefas atômicas no formato Markdown canônico da Spec. */
export function formatTasks(tasks: readonly Task[]): string {
  return tasks
    .map((task) => {
      const marker = task.done ? 'x' : ' ';
      const optional = task.optional ? '*' : '';
      const lines = [`- [${marker}]${optional} ${task.id} ${task.title}`];
      for (const detail of task.details) lines.push(`  - ${detail}`);
      lines.push(`  - _Requirements: ${task.requirements.join(', ')}_`);
      lines.push(`  - _Depends: ${task.dependsOn.length === 0 ? '-' : task.dependsOn.join(', ')}_`);
      lines.push(`  - _Stack: ${task.stack} · Est: ${task.hours}h_`);
      return lines.join('\n');
    })
    .join('\n');
}

export interface GraphIssues {
  missing: [from: string, to: string][];
  cycles: string[][];
}

function findCycle(remaining: Set<string>, tasksById: ReadonlyMap<string, Task>): string[] | null {
  const state = new Map<string, 'visiting' | 'visited'>();
  const stack: string[] = [];
  const visit = (id: string): string[] | null => {
    state.set(id, 'visiting');
    stack.push(id);
    const task = tasksById.get(id);
    for (const dependency of task?.dependsOn ?? []) {
      if (!remaining.has(dependency)) continue;
      if (state.get(dependency) === 'visiting') {
        const start = stack.indexOf(dependency);
        return [...stack.slice(start), dependency];
      }
      if (state.get(dependency) !== 'visited') {
        const cycle = visit(dependency);
        if (cycle !== null) return cycle;
      }
    }
    stack.pop();
    state.set(id, 'visited');
    return null;
  };
  for (const id of remaining) {
    if (state.get(id) === undefined) {
      const cycle = visit(id);
      if (cycle !== null) return cycle;
    }
  }
  return null;
}

/** Detecta arestas ausentes e ciclos usando eliminação topológica de Kahn. */
export function findGraphIssues(tasks: readonly Task[]): GraphIssues {
  const ids = new Set(tasks.map((task) => task.id));
  const missing: [string, string][] = [];
  const seenMissing = new Set<string>();
  const indegree = new Map<string, number>(tasks.map((task) => [task.id, 0]));
  const dependents = new Map<string, string[]>(tasks.map((task) => [task.id, []]));
  for (const task of tasks) {
    for (const dependency of task.dependsOn) {
      if (!ids.has(dependency)) {
        const key = `${task.id}\u0000${dependency}`;
        if (!seenMissing.has(key)) {
          seenMissing.add(key);
          missing.push([task.id, dependency]);
        }
        continue;
      }
      indegree.set(task.id, (indegree.get(task.id) ?? 0) + 1);
      dependents.get(dependency)?.push(task.id);
    }
  }
  const queue = [...tasks].filter((task) => indegree.get(task.id) === 0).map((task) => task.id);
  let processed = 0;
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) continue;
    processed += 1;
    for (const dependent of dependents.get(id) ?? []) {
      const next = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, next);
      if (next === 0) queue.push(dependent);
    }
  }
  const remaining = new Set(tasks.filter((task) => (indegree.get(task.id) ?? 0) > 0).map((task) => task.id));
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const cycles: string[][] = [];
  if (processed < tasks.length) {
    const cycle = findCycle(remaining, tasksById);
    if (cycle !== null) cycles.push(cycle);
  }
  return { missing, cycles };
}
