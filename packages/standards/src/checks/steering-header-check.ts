import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';
import { extractLastModified, loadSteeringFiles } from '../steering/model.ts';

export const steeringHeaderCheck: NamedCheck = {
  name: 'steeringHeaderCheck',
  run(snap: RepoSnapshot): Violation[] {
    return loadSteeringFiles(snap).flatMap((file) => {
      const content = snap.files.get(file.path) ?? '';
      return extractLastModified(content)
        ? []
        : [
            {
              file: file.path,
              requirement: '1.5',
              message: 'cabeçalho sem data válida no formato Última alteração: AAAA-MM-DD',
            },
          ];
    });
  },
};
