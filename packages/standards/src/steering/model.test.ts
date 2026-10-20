import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { effectiveMode, loadSteeringFiles } from './model.ts';

describe('modelo de steering', () => {
  it('extrai ponteiro, data e modo efetivo', () => {
    const snap = snapshotFrom({
      '.kiro/steering/always/constitution.md': '---\ninclusion: always\n---\n#[[file:.kiro/constitution.md]]',
      '.kiro/steering/manual/security.md': '---\n---\nÚltima alteração: 2026-10-08\nregra',
    });
    const files = loadSteeringFiles(snap);
    expect(files[0]?.pointerTarget).toBe('.kiro/constitution.md');
    expect(files[0]?.lastModified).toBeUndefined();
    expect(files[1]?.lastModified).toBe('2026-10-08');
    expect(files[1]).toBeDefined();
    expect(effectiveMode(files[1]!)).toBe('always');
  });

  // Regressão: o ponteiro real tem a linha de data antes do #[[file:]] (Req. 1.5).
  it('reconhece ponteiro com linha de data no cabeçalho', () => {
    const snap = snapshotFrom({
      '.kiro/steering/always/constitution.md':
        '---\ninclusion: always\n---\n\n> Última alteração: 2026-10-08\n\n#[[file:.kiro/constitution.md]]\n',
    });
    const [file] = loadSteeringFiles(snap);
    expect(file?.pointerTarget).toBe('.kiro/constitution.md');
    expect(file?.lastModified).toBe('2026-10-08');
  });
});
