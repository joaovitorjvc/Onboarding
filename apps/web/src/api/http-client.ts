import createClient, { type Client, type Middleware } from 'openapi-fetch';
import type { ErrorFormat, paths } from '@nuagehub/contracts';
import { isErrorFormat } from '@nuagehub/contracts';

export type ErrorHeaders = Headers | Record<string, string | undefined>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const unexpectedMessage = 'Ocorreu um erro inesperado. Tente novamente.';

function getCorrelationId(headers: ErrorHeaders): string | undefined {
  if (headers instanceof Headers) {
    return headers.get('x-correlation-id') ?? undefined;
  }

  const entry = Object.entries(headers).find(([name]) => name.toLowerCase() === 'x-correlation-id');
  return entry?.[1];
}

function createCorrelationId(): string {
  return globalThis.crypto.randomUUID();
}

function normalizeStatus(status: number): number {
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}

export function normalizeError(status: number, payload: unknown, headers: ErrorHeaders): ErrorFormat {
  if (isErrorFormat(payload)) {
    return payload;
  }

  const headerCorrelationId = getCorrelationId(headers);
  const correlationId =
    headerCorrelationId && uuidPattern.test(headerCorrelationId) ? headerCorrelationId : createCorrelationId();

  return {
    code: 'UNEXPECTED_ERROR',
    message: unexpectedMessage,
    correlationId,
    status: normalizeStatus(status),
  };
}

export class HttpError extends Error {
  public readonly error: ErrorFormat;

  public constructor(error: ErrorFormat) {
    super(error.message);
    this.name = 'HttpError';
    this.error = error;
  }
}

async function readPayload(response: Response): Promise<unknown> {
  const body = await response.clone().text();
  if (body.length === 0) {
    return null;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const payload = await readPayload(response);
      throw new HttpError(normalizeError(response.status, payload, response.headers));
    }
  },
};

export function createHttpClient(
  fetcher?: (input: Request) => Promise<Response>,
  baseUrl = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
): Client<paths> {
  const runtimeFetcher = fetcher ?? ((input: Request) => globalThis.fetch(input));
  const client = createClient<paths>({
    baseUrl,
    fetch: runtimeFetcher,
  });
  client.use(errorMiddleware);
  return client;
}

export const httpClient = createHttpClient();
