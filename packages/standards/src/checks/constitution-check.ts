import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';
import { extractLastModified } from '../steering/model.ts';

const REQUIRED_SECTIONS = [
  'Idioma',
  'Segurança',
  'Estrutura do Monorepo',
  'Testes',
  'Contratos entre aplicações',
  'Git',
  'Fluxo de Specs',
];

function sectionTitles(content: string): Set<string> {
  return new Set(
    content
      .split('\n')
      .map((line) => line.match(/^##\s+(.+?)\s*$/)?.[1])
      .filter((title): title is string => title !== undefined),
  );
}

export const constitutionCheck: NamedCheck = {
  name: 'constitutionCheck',
  run(snap: RepoSnapshot): Violation[] {
    const paths = snap.paths.filter((path) => path === '.kiro/constitution.md');
    if (paths.length !== 1) {
      return [
        {
          file: '.kiro/constitution.md',
          requirement: '1.1',
          message: `o Repositório deve conter exatamente uma Constituição em .kiro/constitution.md (encontradas: ${paths.length})`,
        },
      ];
    }

    const file = '.kiro/constitution.md';
    const content = snap.files.get(file) ?? '';
    const violations: Violation[] = [];
    for (const section of REQUIRED_SECTIONS) {
      if (!sectionTitles(content).has(section)) {
        violations.push({ file, requirement: '1.2', message: `seção obrigatória ausente: ## ${section}` });
      }
    }
    if (!extractLastModified(content)) {
      violations.push({
        file,
        requirement: '1.5',
        message: 'cabeçalho sem data válida no formato Última alteração: AAAA-MM-DD',
      });
    }
    return violations;
  },
};
