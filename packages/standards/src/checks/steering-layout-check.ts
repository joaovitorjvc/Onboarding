import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';
import { parseFrontMatter } from '../steering/front-matter.ts';
import { EXPECTED_MODE, effectiveMode, loadSteeringFiles } from '../steering/model.ts';

function hasText(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function patterns(value: string | string[] | undefined): string[] {
  return value === undefined ? [] : Array.isArray(value) ? value.filter(hasText) : hasText(value) ? [value] : [];
}

export const steeringLayoutCheck: NamedCheck = {
  name: 'steeringLayoutCheck',
  run(snap: RepoSnapshot): Violation[] {
    const violations: Violation[] = [];
    for (const file of loadSteeringFiles(snap)) {
      const parsed = parseFrontMatter(file.path, snap.files.get(file.path) ?? '');
      violations.push(...parsed.errors);
      if (parsed.errors.length > 0) continue;

      if (file.folder === null) {
        violations.push({
          file: file.path,
          requirement: '2.7',
          message: 'Arquivo_Steering deve estar em always, auto, conditional ou manual',
        });
        continue;
      }

      const expected = EXPECTED_MODE[file.folder];
      const found = effectiveMode(file);
      if (found !== expected) {
        violations.push({
          file: file.path,
          requirement: '2.6',
          message: `modo esperado ${expected}, modo encontrado ${found} (caminho: ${file.path})`,
        });
      }

      if (file.folder === 'auto' && (!hasText(file.frontMatter.name) || !hasText(file.frontMatter.description))) {
        violations.push({
          file: file.path,
          requirement: '2.3',
          message: 'Steering_Auto exige name e description não vazios',
        });
      }
      if (file.folder === 'conditional' && patterns(file.frontMatter.fileMatchPattern).length === 0) {
        violations.push({
          file: file.path,
          requirement: '2.4',
          message: 'Steering_Conditional exige fileMatchPattern não vazio',
        });
      }
    }
    return violations;
  },
};
