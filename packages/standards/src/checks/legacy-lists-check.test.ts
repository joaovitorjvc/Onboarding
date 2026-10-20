import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { DEFAULT_CONFIG } from '../core/types.ts';
import { legacyListsCheck } from './legacy-lists-check.ts';

const LEGACY = ['index.html', 'primeiros-passos.html', 'plataformas.html', 'playbook.html', 'css/**', 'js/**'];
const prettier = `# Site_Legado\n${LEGACY.join('\n')}\n\n# outros\nnode_modules\n`;
const eslint = `const legacyPaths = [${LEGACY.map((p) => `'${p}'`).join(', ')}];\n`;
const lefthook = `pre-commit:\n  commands:\n    prettier:\n      run: prettier --check {staged_files}\n      exclude:\n${LEGACY.map((p) => `        - "${p}"`).join('\n')}\n`;

describe('legacyListsCheck', () => {
  it('aceita listas iguais', () => {
    const snap = snapshotFrom({
      'standards.config.json': '{}',
      '.prettierignore': prettier,
      'eslint.config.mjs': eslint,
      'lefthook.yml': lefthook,
    });
    expect(legacyListsCheck.run(snap)).toEqual([]);
  });

  it('aceita a mesma lista em todos os comandos', () => {
    const lefthookWithMultipleCommands = `pre-commit:\n  commands:\n    prettier:\n      run: prettier --check {staged_files}\n      exclude:\n${LEGACY.map((p) => `        - "${p}"`).join('\n')}\n    eslint:\n      run: eslint {staged_files}\n      exclude:\n${LEGACY.map((p) => `        - "${p}"`).join('\n')}\n`;
    const snap = snapshotFrom({
      'standards.config.json': '{}',
      '.prettierignore': prettier,
      'eslint.config.mjs': eslint,
      'lefthook.yml': lefthookWithMultipleCommands,
    });
    expect(legacyListsCheck.run(snap)).toEqual([]);
  });

  it('aceita lista canônica vazia sem seção, sem itens e sem exclude', () => {
    const snap = snapshotFrom(
      {
        'standards.config.json': '{}',
        '.prettierignore': '# Gerados\nnode_modules\n',
        'eslint.config.mjs': 'const legacyPaths = [];\n',
        'lefthook.yml': 'pre-commit:\n  commands:\n    prettier:\n      run: prettier --check {staged_files}\n',
      },
      { config: { ...DEFAULT_CONFIG, legacyPaths: [] } },
    );
    expect(legacyListsCheck.run(snap)).toEqual([]);
  });

  it('exige exclude enquanto a lista canônica não estiver vazia', () => {
    const snap = snapshotFrom({
      'standards.config.json': '{}',
      '.prettierignore': prettier,
      'eslint.config.mjs': eslint,
      'lefthook.yml': 'pre-commit:\n  commands:\n    prettier:\n      run: prettier --check {staged_files}\n',
    });
    expect(legacyListsCheck.run(snap).map((v) => v.file)).toEqual(['lefthook.yml']);
  });

  it('reporta divergência e arquivos obrigatórios ausentes', () => {
    const snap = snapshotFrom({
      'standards.config.json': '{}',
      'eslint.config.mjs': eslint.replace("'js/**', ", '').replace(", 'js/**'", ''),
    });
    const files = legacyListsCheck.run(snap).map((v) => `${v.file} ${v.requirement}`);
    expect(files).toContain('.prettierignore 18.5');
    expect(files).toContain('eslint.config.mjs 18.5');
  });
});
