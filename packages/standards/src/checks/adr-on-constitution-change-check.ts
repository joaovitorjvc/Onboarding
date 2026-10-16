import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

const ADR_PATH_PATTERN = /^docs\/adr\/\d{4}-.+\.md$/;

/** Exige ADR novo somente no modo CI, quando changedFiles foi fornecido. */
export const adrOnConstitutionChangeCheck: NamedCheck = {
  name: 'adr-on-constitution-change-check',
  run: (snap: RepoSnapshot): Violation[] => {
    if (snap.changedFiles === undefined) return [];
    const changed = new Set(snap.changedFiles);
    if (!changed.has('.kiro/constitution.md')) return [];
    const hasAdr = snap.changedFiles.some((path) => ADR_PATH_PATTERN.test(path));
    if (hasAdr) return [];
    return [
      {
        file: '.kiro/constitution.md',
        requirement: '1.6',
        message:
          'a alteração da Constituição exige um novo ADR em docs/adr/NNNN-*.md na mesma lista de arquivos alterados',
      },
    ];
  },
};
