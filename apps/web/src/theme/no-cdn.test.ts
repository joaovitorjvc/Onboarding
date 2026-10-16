import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('fontes e scripts locais', () => {
  it('não inclui origens CDN no build', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'nuagehub-web-'));
    try {
      execFileSync('pnpm', ['exec', 'vite', 'build', '--outDir', outDir], { cwd: process.cwd(), stdio: 'ignore' });
      const files = globFiles(outDir);
      const output = files.map((file) => readFileSync(file, 'utf8')).join('\n');
      expect(output).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com/u);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }, 120_000);
});

function globFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? globFiles(path) : statSync(path).isFile() ? [path] : [];
  });
}
