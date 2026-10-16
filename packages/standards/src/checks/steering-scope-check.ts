import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';
import { loadSteeringFiles } from '../steering/model.ts';

const EXPECTED = {
  'react.md': 'apps/web/',
  'nestjs.md': 'apps/api/',
  'python-ai.md': 'services/ai/',
} as const;

function asPatterns(value: string | string[] | undefined): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  return value?.filter((pattern) => pattern.trim()).map((pattern) => pattern.trim()) ?? [];
}

export const steeringScopeCheck: NamedCheck = {
  name: 'steeringScopeCheck',
  run(snap: RepoSnapshot): Violation[] {
    const files = loadSteeringFiles(snap);
    const violations: Violation[] = [];
    for (const [name, scope] of Object.entries(EXPECTED)) {
      const file = files.find((candidate) => candidate.path === `.kiro/steering/conditional/${name}`);
      if (!file) {
        violations.push({
          file: `.kiro/steering/conditional/${name}`,
          requirement: '2.8',
          message: 'Steering_Conditional obrigatório ausente',
        });
        continue;
      }
      const globs = asPatterns(file.frontMatter.fileMatchPattern);
      if (globs.length === 0 || globs.some((glob) => !glob.startsWith(scope))) {
        violations.push({
          file: file.path,
          requirement: '2.8',
          message: `fileMatchPattern deve ficar dentro de ${scope} (encontrado: ${globs.join(', ') || '(vazio)'})`,
        });
      }
    }
    return violations;
  },
};
