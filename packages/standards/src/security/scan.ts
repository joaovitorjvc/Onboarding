import { extname } from 'node:path';
import { SECURITY_RULES } from './rules.ts';

export type BlockingCategory =
  'hardcoded-secret' | 'sql-injection' | 'command-injection' | 'dynamic-eval' | 'unsafe-html';
export type WarningCategory =
  | 'insecure-deserialization'
  | 'tls-verification-disabled'
  | 'permissive-cors'
  | 'weak-crypto'
  | 'file-too-large'
  | 'invalid-suppression';
export type Category = BlockingCategory | WarningCategory;
export type SecurityLanguage = 'ts' | 'js' | 'py' | 'any';

export interface Rule {
  id: string;
  category: Category;
  languages: readonly SecurityLanguage[];
  pattern: RegExp;
  suggestion: string;
}

export interface Finding {
  filePath: string;
  line: number;
  category: Category;
  severity: 'blocking' | 'warning';
  ruleId: string;
  suggestion: string;
}

const blocking = new Set<BlockingCategory>([
  'hardcoded-secret',
  'sql-injection',
  'command-injection',
  'dynamic-eval',
  'unsafe-html',
]);
const categories = new Set<Category>([
  'hardcoded-secret',
  'sql-injection',
  'command-injection',
  'dynamic-eval',
  'unsafe-html',
  'insecure-deserialization',
  'tls-verification-disabled',
  'permissive-cors',
  'weak-crypto',
  'file-too-large',
  'invalid-suppression',
]);

function languageFor(path: string): SecurityLanguage {
  const extension = extname(path).toLowerCase();
  if (extension === '.py') return 'py';
  if (extension === '.js' || extension === '.jsx' || extension === '.mjs' || extension === '.cjs') return 'js';
  if (extension === '.ts' || extension === '.tsx' || extension === '.mts' || extension === '.cts') return 'ts';
  return 'any';
}

function severityFor(category: Category): Finding['severity'] {
  return blocking.has(category as BlockingCategory) ? 'blocking' : 'warning';
}

function finding(filePath: string, line: number, category: Category, ruleId: string, suggestion: string): Finding {
  return { filePath, line, category, severity: severityFor(category), ruleId, suggestion };
}

function isExampleSecretPath(filePath: string): boolean {
  return filePath === '.env.example' || filePath.endsWith('/.env.example');
}

function isPlaceholder(value: string): boolean {
  return /^(?:<[^>]+>|\$\{[^}]+\}|changeme|change[-_ ]?me|your[-_ ]?(?:token|secret|password|api[-_ ]?key)|example|placeholder)$/i.test(
    value.trim(),
  );
}

function hasValidSuppression(line: string, category: Category): boolean {
  const match = line.match(/(?:\/\/|#)\s*security-ignore:\s*([a-z-]+)\s*--\s*(.*)$/i);
  return match !== null && (match[1] ?? '').toLowerCase() === category && (match[2] ?? '').trim().length > 0;
}

function suppressionStatus(line: string): { category: string; valid: boolean } | null {
  const match = line.match(/(?:\/\/|#)\s*security-ignore:\s*([a-z-]+)(?:\s*--\s*(.*))?$/i);
  if (!match) return null;
  const category = (match[1] ?? '').toLowerCase();
  return { category, valid: categories.has(category as Category) && (match[2]?.trim().length ?? 0) > 0 };
}

function isSuppressed(lines: readonly string[], line: number, category: Category): boolean {
  return [line - 1, line].some((index) => index >= 1 && hasValidSuppression(lines[index - 1] ?? '', category));
}

function shouldIgnoreSecret(filePath: string, line: string, ruleId: string): boolean {
  if (ruleId !== 'secret-known-prefix' && ruleId !== 'secret-assignment') return false;
  if (isExampleSecretPath(filePath)) return true;
  const values = line.match(/["'`]([^"'`]*)["'`]/g) ?? [];
  return values.some((value) => isPlaceholder(value.slice(1, -1)));
}

function matches(pattern: RegExp, line: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(line);
}

/** Varre conteúdo textual com limites de tamanho, binário e supressões locais. */
export function scan(filePath: string, content: string, rules?: readonly Rule[]): Finding[] {
  if (Buffer.byteLength(content, 'utf8') > 1024 * 1024) {
    return [
      finding(
        filePath,
        1,
        'file-too-large',
        'file-too-large',
        'Reduza o arquivo para no máximo 1 MB antes de solicitar a escrita.',
      ),
    ];
  }
  if (content.slice(0, 8192).includes('\0')) return [];

  const activeRules = rules ?? SECURITY_RULES;
  const lines = content.split(/\r?\n/);
  const findings: Finding[] = [];
  const invalidSuppressionLines = new Set<number>();

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const status = suppressionStatus(lines[index] ?? '');
    if (status && (!status.valid || !categories.has(status.category as Category))) {
      invalidSuppressionLines.add(lineNumber);
    }
  }

  for (const lineNumber of invalidSuppressionLines) {
    findings.push(
      finding(
        filePath,
        lineNumber,
        'invalid-suppression',
        'invalid-suppression',
        'Informe uma categoria válida e uma justificativa não vazia após "--".',
      ),
    );
  }

  const fileLanguage = languageFor(filePath);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const lineNumber = index + 1;
    for (const rule of activeRules) {
      if (!rule.languages.includes('any') && !rule.languages.includes(fileLanguage)) continue;
      if (shouldIgnoreSecret(filePath, line, rule.id) || !matches(rule.pattern, line)) continue;
      if (isSuppressed(lines, lineNumber, rule.category)) continue;
      findings.push(finding(filePath, lineNumber, rule.category, rule.id, rule.suggestion));
    }
  }
  return findings.sort(
    (a, b) => a.line - b.line || a.category.localeCompare(b.category) || a.ruleId.localeCompare(b.ruleId),
  );
}
