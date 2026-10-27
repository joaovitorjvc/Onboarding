import { describe, expect, it } from 'vitest';
import { resolveExecutable } from './run.ts';

describe('resolveExecutable', () => {
  it('resolve pnpm para pnpm.cmd no Windows', () => {
    expect(resolveExecutable('pnpm', 'win32')).toBe('pnpm.cmd');
  });

  it('mantém pnpm em Linux e macOS', () => {
    expect(resolveExecutable('pnpm', 'linux')).toBe('pnpm');
    expect(resolveExecutable('pnpm', 'darwin')).toBe('pnpm');
  });

  it('mantém executáveis que não são pnpm', () => {
    expect(resolveExecutable('uv', 'win32')).toBe('uv');
  });
});
