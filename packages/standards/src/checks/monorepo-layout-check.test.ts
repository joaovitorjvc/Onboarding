import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_CHECKS } from './registry.ts';
import { REQUIRED_FILES, monorepoLayoutCheck } from './monorepo-layout-check.ts';
import { runChecks } from '../core/run-checks.ts';
import { findRepoRoot, listRepoFiles, loadSnapshot, snapshotFrom } from '../core/snapshot.ts';

const ROOT = findRepoRoot(import.meta.dirname);

describe('monorepoLayoutCheck', () => {
  it('acusa arquivos obrigatórios, lockfile extra e README/uv.lock ausentes', () => {
    const files: Record<string, string> = {};
    for (const { path } of REQUIRED_FILES) files[path] = '';
    Object.assign(files, {
      '.kiro/specs/x/requirements.md': '',
      '.kiro/steering/always/a.md': '',
      'packages/config/package.json': '',
      'services/ai/demo/pyproject.toml': '',
      'apps/web/README.md': '',
      'apps/api/package-lock.json': '',
    });
    const v = monorepoLayoutCheck.run(snapshotFrom(files)).map((x) => `${x.file} ${x.requirement}`);
    expect(v).toEqual(
      expect.arrayContaining([
        'apps/api/package-lock.json 8.3',
        'services/ai/demo/uv.lock 8.4',
        'services/ai/demo/README.md 8.5',
        'apps/api/README.md 8.5',
      ]),
    );
    expect(v).toHaveLength(4);
  });
});

describe('Repositório real', () => {
  it('passa em todas as checagens em menos de 30 s (Req. 17.6)', () => {
    const started = performance.now();
    const violations = runChecks(loadSnapshot(ROOT), ALL_CHECKS);
    expect(violations).toEqual([]);
    expect(performance.now() - started).toBeLessThan(30_000);
  });

  it('fixa versões exatas em todos os package.json (Req. 7.7)', () => {
    const manifests = listRepoFiles(ROOT).filter((p) => /(^|\/)package\.json$/.test(p) && !p.includes('node_modules'));
    expect(manifests.length).toBeGreaterThanOrEqual(5);
    const loose: string[] = [];
    for (const m of manifests) {
      const pkg = JSON.parse(readFileSync(join(ROOT, m), 'utf8')) as Record<string, Record<string, string> | undefined>;
      for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        for (const [name, version] of Object.entries(pkg[field] ?? {})) {
          if (version.startsWith('workspace:')) continue;
          if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) loose.push(`${m}: ${name}@${version}`);
        }
      }
    }
    expect(loose).toEqual([]);
  });

  it('mantém testes TS ao lado do código e testes Python em tests/ (Req. 14.6)', () => {
    const files = listRepoFiles(ROOT);
    const misplacedTs = files.filter(
      (p) => /\.(spec|test)\.tsx?$/.test(p) && (/\.spec\.tsx?$/.test(p) || /(^|\/)(__tests__|tests?)\//.test(p)),
    );
    expect(misplacedTs).toEqual([]);
    const misplacedPy = files.filter((p) => /(^|\/)test_[^/]*\.py$/.test(p) && !/\/tests\/test_[^/]+\.py$/.test(p));
    expect(misplacedPy).toEqual([]);
  });

  it('não mantém arquivos do Site_Legado na raiz (Spec legacy-migration, Req. 9.3)', () => {
    const legacy = ['index.html', 'primeiros-passos.html', 'plataformas.html', 'playbook.html'];
    const remaining = listRepoFiles(ROOT).filter((p) => legacy.includes(p) || /^(css|js)\//.test(p));
    expect(remaining).toEqual([]);
  });
});
