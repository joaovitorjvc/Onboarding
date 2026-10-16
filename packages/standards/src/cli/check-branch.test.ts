import { describe, expect, it } from 'vitest';
import { isValidBranchName } from './check-branch.ts';

describe('isValidBranchName', () => {
  it('aceita main e branches Conventional', () => {
    expect(isValidBranchName('main')).toBe(true);
    expect(isValidBranchName('feat/project-standards')).toBe(true);
    expect(isValidBranchName('fix/api-erro-400')).toBe(true);
  });

  it('rejeita nomes fora do formato', () => {
    expect(isValidBranchName('master')).toBe(false);
    expect(isValidBranchName('feature/new')).toBe(false);
    expect(isValidBranchName('feat/Projeto')).toBe(false);
    expect(isValidBranchName('feat/')).toBe(false);
    expect(isValidBranchName('feat/a_b')).toBe(false);
  });
});
