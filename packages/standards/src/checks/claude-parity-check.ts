import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';
import { normalizeClaudeGlobs, parseClaudeModel } from '../claude/model.ts';
import { loadSteeringFiles, normalizeSteeringPath, effectiveMode, type SteeringFile } from '../steering/model.ts';

function resolveAlias(path: string, aliases: ReadonlyMap<string, string>): string {
  let current = normalizeSteeringPath(path);
  const seen = new Set<string>();
  while (aliases.has(current) && !seen.has(current)) {
    seen.add(current);
    current = aliases.get(current) as string;
  }
  return current;
}

function canonicalFiles(files: readonly SteeringFile[]): { aliases: Map<string, string>; expected: Set<string> } {
  const aliases = new Map<string, string>();
  for (const file of files) {
    if (file.pointerTarget) aliases.set(file.path, normalizeSteeringPath(file.pointerTarget));
  }
  const expected = new Set(files.map((file) => resolveAlias(file.path, aliases)));
  return { aliases, expected };
}

function listDifference(left: ReadonlySet<string>, right: ReadonlySet<string>): string[] {
  return [...left].filter((item) => !right.has(item)).sort();
}

function patternsFor(file: SteeringFile): string[] {
  const value = file.frontMatter.fileMatchPattern;
  const values = value === undefined ? [] : Array.isArray(value) ? value : [value];
  return normalizeClaudeGlobs(values);
}

function channelViolation(file: SteeringFile, channel: string, actual: ReadonlySet<string>): Violation | undefined {
  const canonical = file.pointerTarget ? normalizeSteeringPath(file.pointerTarget) : file.path;
  if (actual.has(canonical)) return undefined;
  return {
    file: file.path,
    requirement: channel === 'imports' ? '3.1' : channel === 'scopedRules' ? '3.2' : '3.3',
    message: `arquivo deve ser referenciado em ${channel}: ${canonical}`,
  };
}

export const claudeParityCheck: NamedCheck = {
  name: 'claudeParityCheck',
  run(snap: RepoSnapshot): Violation[] {
    const files = loadSteeringFiles(snap);
    const { aliases, expected } = canonicalFiles(files);
    const model = parseClaudeModel(snap);
    const violations: Violation[] = [];

    for (const invalid of model.invalidLines) {
      const content = snap.files.get(invalid.file) ?? '';
      const line = content.split('\n')[invalid.line - 1]?.trim() ?? '';
      const requirement =
        invalid.file.startsWith('.claude/rules/') && line.startsWith('@.kiro/')
          ? '3.2'
          : invalid.file === 'CLAUDE.md'
            ? '3.4'
            : '3.7';
      const detail =
        requirement === '3.2'
          ? 'importação @.kiro/... não resolve em .claude/rules (ADR-0002)'
          : 'linha não pertence à gramática de navegação';
      violations.push({
        file: invalid.file,
        requirement,
        message: `linha ${invalid.line}, seção ${invalid.section}: ${detail}`,
      });
    }

    const actual = new Set(
      [...model.imports, ...model.onDemandRefs, ...model.scopedRules.flatMap((rule) => rule.imports)].map((path) =>
        resolveAlias(path, aliases),
      ),
    );
    const missing = listDifference(expected, actual);
    const excess = listDifference(actual, expected);
    if (missing.length > 0) {
      violations.push({
        file: 'CLAUDE.md',
        requirement: '3.5',
        message: `Arquivos_Steering ausentes: ${missing.join(', ')}`,
      });
    }
    if (excess.length > 0) {
      violations.push({
        file: 'CLAUDE.md',
        requirement: '3.5',
        message: `Arquivos referenciados em excesso: ${excess.join(', ')}`,
      });
    }

    const imports = new Set(model.imports.map((path) => resolveAlias(path, aliases)));
    const onDemand = new Set(model.onDemandRefs.map((path) => resolveAlias(path, aliases)));
    const scoped = new Set(
      model.scopedRules.flatMap((rule) => rule.imports).map((path) => resolveAlias(path, aliases)),
    );
    for (const file of files) {
      const mode = effectiveMode(file);
      const channel = mode === 'always' ? 'imports' : mode === 'fileMatch' ? 'scopedRules' : 'onDemandRefs';
      const actualChannel = channel === 'imports' ? imports : channel === 'scopedRules' ? scoped : onDemand;
      const violation = channelViolation(file, channel, actualChannel);
      if (violation) violations.push(violation);
    }

    for (const file of files.filter((candidate) => effectiveMode(candidate) === 'fileMatch')) {
      const target = resolveAlias(file.path, aliases);
      const rules = model.scopedRules.filter((rule) =>
        rule.imports.some((path) => resolveAlias(path, aliases) === target),
      );
      const expectedGlobs = patternsFor(file);
      for (const rule of rules) {
        const actualGlobs = normalizeClaudeGlobs(rule.globs);
        if (expectedGlobs.join('\u0000') !== actualGlobs.join('\u0000')) {
          violations.push({
            file: rule.path,
            requirement: '3.6',
            message: `glob divergente para ${target}: esperado [${expectedGlobs.join(', ')}], encontrado [${actualGlobs.join(', ')}]`,
          });
        }
      }
    }

    return violations;
  },
};
