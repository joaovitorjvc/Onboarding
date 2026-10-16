import { extractEstimate } from './spec-structure-check.ts';
import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

const EPIC_REQUIREMENTS_LINK = /\[[^\]]*\]\(\.\.\/epic-requirements\.md(?:#[^)]+)?\)/;
const EPIC_DESIGN_LINK = /\[[^\]]*\]\(\.\.\/epic-design\.md(?:#[^)]+)?\)/;

function directDirectories(paths: readonly string[], parent: string): string[] {
  const prefix = `${parent}/`;
  const names = new Set<string>();
  for (const path of paths) {
    if (!path.startsWith(prefix)) continue;
    const remainder = path.slice(prefix.length);
    const slash = remainder.indexOf('/');
    if (slash > 0) names.add(remainder.slice(0, slash));
  }
  return [...names].sort();
}

/** Verifica os links relativos obrigatórios de uma Sub_Funcionalidade. */
export const epicLinkCheck: NamedCheck = {
  name: 'epic-link-check',
  run: (snap: RepoSnapshot): Violation[] => {
    const violations: Violation[] = [];
    const prefix = '.kiro/specs/';
    const epicNames = new Set<string>();
    for (const path of snap.paths) {
      if (!path.startsWith(prefix)) continue;
      const name = path.slice(prefix.length).split('/')[0] ?? '';
      if (name !== '') epicNames.add(name);
    }

    for (const name of [...epicNames].sort()) {
      const epicPath = `${prefix}${name}`;
      const estimate = extractEstimate(
        snap.files.get(`${epicPath}/requirements.md`) ?? snap.files.get(`${epicPath}/epic-requirements.md`),
      );
      if (estimate === null || estimate <= snap.config.specMaxHours) continue;
      for (const subfeature of directDirectories(snap.paths, epicPath)) {
        const subfeaturePath = `${epicPath}/${subfeature}`;
        for (const [document, pattern, target] of [
          ['requirements.md', EPIC_REQUIREMENTS_LINK, '../epic-requirements.md'],
          ['design.md', EPIC_DESIGN_LINK, '../epic-design.md'],
        ] as const) {
          const path = `${subfeaturePath}/${document}`;
          const content = snap.files.get(path);
          if (content !== undefined && !pattern.test(content)) {
            violations.push({
              file: path,
              requirement: '6.7',
              message: `o documento deve conter um link Markdown relativo para ${target}`,
            });
          }
        }
      }
    }
    return violations;
  },
};
