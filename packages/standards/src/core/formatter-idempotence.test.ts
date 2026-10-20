// Property 21: a configuração versionada do Prettier e do ruff é idempotente no corpus real.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import * as prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import { findRepoRoot, listRepoFiles } from './snapshot.ts';
import { isLegacy } from './paths.ts';
import { DEFAULT_CONFIG } from './types.ts';

const ROOT = findRepoRoot(import.meta.dirname);
const files = listRepoFiles(ROOT).filter((p) => !isLegacy(p, DEFAULT_CONFIG.legacyPaths));
const IGNORED = /(^|\/)(generated|fixtures|openapi)\/|^\.kiro\/specs\//;
const tsCorpus = files.filter((p) => /\.(ts|tsx|json|md)$/.test(p) && !IGNORED.test(p) && !p.endsWith('lock.json'));
const pyCorpus = files.filter((p) => p.endsWith('.py') && !IGNORED.test(p));

/** Perturba espaçamento sem mudar a semântica: espaços ao fim da linha e linhas em branco extras. */
function perturb(source: string, seeds: readonly number[]): string {
  const lines = source.split('\n');
  return lines
    .map((line, i) => {
      const s = seeds[i % seeds.length] ?? 0;
      if (s % 3 === 0) return `${line}   `;
      if (s % 5 === 0 && line.trim() === '') return '\n';
      return line;
    })
    .join('\n');
}

async function formatWithPrettier(path: string, source: string): Promise<string> {
  const options = (await prettier.resolveConfig(join(ROOT, path))) ?? {};
  return prettier.format(source, { ...options, filepath: join(ROOT, path) });
}

function ruffFormat(source: string): string {
  return execFileSync('uvx', ['ruff@0.13.1', 'format', '--config', join(ROOT, 'ruff.toml'), '-'], {
    input: source,
    encoding: 'utf8',
  });
}

describe('idempotência do formatador', () => {
  // Feature: project-standards, Property 21: Idempotência do formatador
  it('Property 21: format(format(x)) == format(x) para TS/JSON/MD (Prettier) e Python (ruff)', async () => {
    expect(tsCorpus.length).toBeGreaterThan(10);
    expect(pyCorpus.length).toBeGreaterThan(3);
    const pyFormatted = new Map<string, string>();
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...tsCorpus, ...pyCorpus),
        fc.array(fc.nat(30), { minLength: 1, maxLength: 8 }),
        async (path, seeds) => {
          const source = perturb(readFileSync(join(ROOT, path), 'utf8'), seeds);
          if (path.endsWith('.py')) {
            // ruff roda fora do processo; memoriza por entrada para manter o teste rápido.
            const key = `${path}:${seeds.join(',')}`;
            const once = pyFormatted.get(key) ?? ruffFormat(source);
            pyFormatted.set(key, once);
            expect(ruffFormat(once)).toBe(once);
          } else {
            const once = await formatWithPrettier(path, source);
            expect(await formatWithPrettier(path, once)).toBe(once);
          }
        },
      ),
      { numRuns: 100 },
    );
  }, 120_000);
});
