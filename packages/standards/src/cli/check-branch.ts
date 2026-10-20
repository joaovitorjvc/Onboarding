#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const BRANCH_PATTERN = /^(feat|fix|docs|chore|refactor|test|ci|perf|build)\/[a-z0-9-]+$/;

export function isValidBranchName(name: string): boolean {
  return name === 'main' || BRANCH_PATTERN.test(name);
}

export function resolveBranchName(argument?: string, env: NodeJS.ProcessEnv = process.env): string {
  if (argument) return argument;
  if (env.GITHUB_HEAD_REF) return env.GITHUB_HEAD_REF;
  if (env.GITHUB_REF_NAME) return env.GITHUB_REF_NAME;
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function main(): void {
  const branch = resolveBranchName(process.argv[2]);
  if (!isValidBranchName(branch)) {
    process.stderr.write(`Nome de branch inválido: ${branch || '(vazio)'}\nEsperado: tipo/descricao-curta ou main\n`);
    process.exitCode = 1;
  }
}

if (import.meta.main) main();
