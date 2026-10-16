import { parse as parseYaml } from 'yaml';
import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

function sameList(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function formatList(values: readonly string[]): string {
  return values.length === 0 ? '(vazia)' : values.join(', ');
}

function prettierLegacyPaths(content: string): string[] {
  const section = content.match(/#\s*Site_Legado[^\n]*\n([\s\S]*?)(?:\n\s*\n|$)/i)?.[1] ?? '';
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

function eslintLegacyPaths(content: string): string[] | null {
  const match = content.match(/const\s+legacyPaths\s*=\s*\[([\s\S]*?)\]/);
  if (match === null) return null;
  return [...(match[1] ?? '').matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1] ?? '');
}

function commandObjects(value: unknown, output: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value) commandObjects(item, output);
    return output;
  }
  if (value === null || typeof value !== 'object') return output;
  const object = value as Record<string, unknown>;
  if ('run' in object || 'script' in object) output.push(object);
  for (const child of Object.values(object)) commandObjects(child, output);
  return output;
}

/**
 * O formato esperado para lefthook.yml é uma lista YAML `exclude:` em cada
 * objeto de comando (aquele que contém `run` ou `script`), com exatamente os
 * mesmos legacyPaths do standards.config.json.
 */
function lefthookLegacyPaths(content: string): { lists: string[][]; invalidCommands: number } {
  const parsed = parseYaml(content) as unknown;
  const commands = commandObjects(parsed);
  let invalidCommands = 0;
  const lists = commands.map((command) => {
    const exclude = command.exclude;
    if (!Array.isArray(exclude)) {
      invalidCommands += 1;
      return [];
    }
    return exclude.filter((item): item is string => typeof item === 'string');
  });
  return { lists, invalidCommands };
}

function reportMismatch(
  violations: Violation[],
  file: string,
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (!sameList(actual, expected)) {
    violations.push({
      file,
      requirement: '18.5',
      message: `legacyPaths divergentes; esperado: ${formatList(expected)}; encontrado: ${formatList(actual)}`,
    });
  }
}

/** Confere a lista canônica nos formatadores, linter e hooks Git. */
export const legacyListsCheck: NamedCheck = {
  name: 'legacy-lists-check',
  run: (snap: RepoSnapshot): Violation[] => {
    const expected = snap.config.legacyPaths;
    const violations: Violation[] = [];
    if (!snap.files.has('standards.config.json')) {
      violations.push({ file: 'standards.config.json', requirement: '18.5', message: 'arquivo obrigatório ausente' });
    }

    const prettier = snap.files.get('.prettierignore');
    if (prettier === undefined) {
      violations.push({ file: '.prettierignore', requirement: '18.5', message: 'arquivo obrigatório ausente' });
    } else {
      reportMismatch(violations, '.prettierignore', prettierLegacyPaths(prettier), expected);
    }

    const eslint = snap.files.get('eslint.config.mjs');
    if (eslint === undefined) {
      violations.push({ file: 'eslint.config.mjs', requirement: '18.5', message: 'arquivo obrigatório ausente' });
    } else {
      const values = eslintLegacyPaths(eslint);
      if (values === null) {
        violations.push({
          file: 'eslint.config.mjs',
          requirement: '18.5',
          message: 'não foi encontrada a declaração const legacyPaths = [...]',
        });
      } else {
        reportMismatch(violations, 'eslint.config.mjs', values, expected);
      }
    }

    const lefthook = snap.files.get('lefthook.yml');
    if (lefthook !== undefined) {
      try {
        const result = lefthookLegacyPaths(lefthook);
        if (result.invalidCommands > 0) {
          violations.push({
            file: 'lefthook.yml',
            requirement: '18.5',
            message: `${result.invalidCommands} comando(s) não possui(em) exclude como lista YAML`,
          });
        } else if (result.lists.some((values) => !sameList(values, expected))) {
          const found = result.lists.map((values) => `[${formatList(values)}]`).join('; ');
          violations.push({
            file: 'lefthook.yml',
            requirement: '18.5',
            message: `legacyPaths divergentes em um ou mais comandos; esperado: ${formatList(expected)}; encontrado: ${found}`,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        violations.push({ file: 'lefthook.yml', requirement: '18.5', message: `YAML inválido: ${message}` });
      }
    }
    return violations;
  },
};
