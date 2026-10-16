import type { ErrorFormat } from './generated/error-format';

const allowedKeys = new Set(['code', 'message', 'correlationId', 'status', 'details']);
const codePattern = /^[A-Z][A-Z0-9_]{2,63}$/;
const uuidPattern = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedKeys(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => keys.has(key));
}

function isErrorDetail(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasOnlyAllowedKeys(value, new Set(['field', 'issue'])) &&
    typeof value.field === 'string' &&
    typeof value.issue === 'string' &&
    Object.prototype.hasOwnProperty.call(value, 'field') &&
    Object.prototype.hasOwnProperty.call(value, 'issue')
  );
}

export function isErrorFormat(value: unknown): value is ErrorFormat {
  if (!isRecord(value) || !hasOnlyAllowedKeys(value, allowedKeys)) return false;
  if (
    typeof value.code !== 'string' ||
    typeof value.message !== 'string' ||
    typeof value.correlationId !== 'string' ||
    typeof value.status !== 'number' ||
    !Number.isInteger(value.status)
  ) {
    return false;
  }
  if (!codePattern.test(value.code) || value.message.length < 1 || value.message.length > 500) return false;
  if (!uuidPattern.test(value.correlationId) || value.status < 400 || value.status > 599) return false;
  if (Object.prototype.hasOwnProperty.call(value, 'details')) {
    if (!Array.isArray(value.details) || !value.details.every(isErrorDetail)) return false;
  }
  return ['code', 'message', 'correlationId', 'status'].every((key) =>
    Object.prototype.hasOwnProperty.call(value, key),
  );
}

export function parse(json: string): ErrorFormat {
  let value: unknown;
  try {
    value = JSON.parse(json) as unknown;
  } catch {
    throw new Error('JSON de Formato_de_Erro inválido.');
  }
  if (!isErrorFormat(value)) throw new Error('Formato_de_Erro inválido.');
  return value;
}

export function serialize(value: ErrorFormat): string {
  if (!isErrorFormat(value)) throw new Error('Formato_de_Erro inválido.');
  return JSON.stringify(value);
}
