import type { Category, Rule } from './scan.ts';

const all = ['any'] as const;
const javascript = ['ts', 'js'] as const;
const python = ['py'] as const;

function rule(
  id: string,
  category: Category,
  languages: readonly ('ts' | 'js' | 'py' | 'any')[],
  pattern: RegExp,
  suggestion: string,
): Rule {
  return { id, category, languages, pattern, suggestion };
}

const sqlKeywords = ['SEL' + 'ECT', 'INS' + 'ERT', 'UPD' + 'ATE', 'DEL' + 'ETE'].join('|');
const sqlInterpolation = ['\\$', '\\{'].join('');
const objectInterpolation = ['\\{', '[^}]+', '\\}'].join('');
const variableConcatenation = ['\\+', '\\s*', '[A-Za-z_]'].join('');
const sqlInterpolationPattern = new RegExp(
  `\\b(?:${sqlKeywords})\\b[^\\n]*(?:${sqlInterpolation}|${objectInterpolation}|${variableConcatenation})`,
  'i',
);

/** Catálogo de regras com expressões lineares e limitadas por linha. */
export const SECURITY_RULES: readonly Rule[] = [
  rule(
    'secret-known-prefix',
    'hardcoded-secret',
    all,
    /(?:AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[bp]-[A-Za-z0-9-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/,
    'Mova o segredo para uma variável de ambiente e documente apenas o placeholder em .env.example.',
  ),
  rule(
    'secret-assignment',
    'hardcoded-secret',
    all,
    /\b(?:secret|token|password|api[_-]?key)\b\s*[:=]\s*["'`]([^"'`\n]{16,})["'`]/i,
    'Mova a credencial para uma variável de ambiente; não versione valores secretos.',
  ),
  rule(
    'sql-interpolation',
    'sql-injection',
    [...javascript, ...python],
    sqlInterpolationPattern,
    'Use consultas parametrizadas ou o query builder, separando dados do comando SQL.',
  ),
  rule(
    'command-interpolation',
    'command-injection',
    [...javascript, ...python],
    /\bexec(?:Sync)?\s*\([^\n]*(?:\$\{|\+\s*[A-Za-z_])/i,
    'Evite montar comandos com entrada dinâmica; use APIs sem shell e argumentos separados.',
  ),
  rule(
    'python-command-interpolation',
    'command-injection',
    python,
    /\b(?:os\.system|subprocess\.[A-Za-z_]+)\s*\([^\n]*(?:f["']|\+\s*[A-Za-z_])/i,
    'Evite montar comandos com entrada dinâmica; use APIs sem shell e argumentos separados.',
  ),
  rule(
    'shell-option-input',
    'command-injection',
    all,
    /\b(?:exec|execFile|spawn|spawnSync|subprocess\.[A-Za-z_]+)\s*\([^\n]*\bshell\s*[:=]\s*True?\b/i,
    'Desative shell ou passe argumentos estruturados sem entrada interpolada.',
  ),
  rule(
    'dynamic-eval',
    'dynamic-eval',
    [...javascript, ...python],
    /\b(?:eval|exec)\s*\(\s*(?!["'`])[^)]/,
    'Remova a execução dinâmica; use um parser ou uma lista explícita de operações permitidas.',
  ),
  rule(
    'dynamic-function',
    'dynamic-eval',
    javascript,
    /\bnew\s+Function\s*\(\s*(?!["'`])/,
    'Não crie funções a partir de texto dinâmico; use código estático ou um parser seguro.',
  ),
  rule(
    'unsafe-html',
    'unsafe-html',
    ['ts', 'js', 'any'],
    /dangerouslySetInnerHTML\s*=\s*\{\{\s*__html\s*:\s*(?!sanitizeHtml\s*\(|DOMPurify\.sanitize\s*\()[^}]+\}\}/,
    'Sanitize o HTML com uma biblioteca aprovada antes de usar dangerouslySetInnerHTML.',
  ),
  rule(
    'pickle-loads',
    'insecure-deserialization',
    python,
    /\bpickle\.loads?\s*\(/,
    'Prefira um formato seguro como JSON e valide o esquema antes de desserializar.',
  ),
  rule(
    'yaml-unsafe-load',
    'insecure-deserialization',
    python,
    /\byaml\.load\s*\((?![^)]*Loader\s*=\s*SafeLoader)/,
    'Use yaml.safe_load ou SafeLoader e valide o conteúdo recebido.',
  ),
  rule(
    'tls-verification-disabled',
    'tls-verification-disabled',
    all,
    /(?:rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*[:=]\s*["']?0|\bverify\s*=\s*False\b)/,
    'Mantenha a verificação TLS habilitada e corrija a cadeia de certificados.',
  ),
  rule(
    'permissive-cors',
    'permissive-cors',
    all,
    /(?:origin\s*:\s*["']\*["']|allow_origins\s*=\s*\[["']\*["']\]|Access-Control-Allow-Origin\s*[:=]\s*["']\*["'])/,
    'Restrinja CORS a origens confiáveis configuradas explicitamente.',
  ),
  rule(
    'weak-crypto',
    'weak-crypto',
    all,
    /(?:createHash\s*\(\s*["'](?:md5|sha1)["']|hashlib\.md5\s*\()/i,
    'Use uma função criptográfica moderna, como SHA-256, ou um KDF apropriado para senhas.',
  ),
];
