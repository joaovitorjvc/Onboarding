import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const configPath = `${packageRoot}/commitlint.config.mjs`;

function lintCommit(message: string): boolean {
  try {
    execFileSync('pnpm', ['exec', 'commitlint', '--config', configPath], {
      cwd: packageRoot,
      input: `${message}\n`,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return true;
  } catch {
    return false;
  }
}

describe('configuração do commitlint', () => {
  it.each(['feat(web): adiciona página', 'docs(standards): x'])('aceita %s', (message) => {
    expect(lintCommit(message)).toBe(true);
  });

  it.each(['feat: sem escopo', 'update stuff', 'feat(foo): escopo inválido'])('rejeita %s', (message) => {
    expect(lintCommit(message)).toBe(false);
  });
});
