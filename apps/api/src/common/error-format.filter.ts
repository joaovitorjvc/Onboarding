import { randomUUID } from 'node:crypto';
import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { ErrorDetail, ErrorFormat } from '@nuagehub/contracts';
import type { Request, Response } from 'express';
import { logger } from './logger';

const statusCodes: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
};

type CorrelatedRequest = Request & { correlationId?: string };
type ExceptionPayload = { message?: unknown; details?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validDetails(value: unknown): value is ErrorDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.field === 'string' &&
        typeof item.issue === 'string' &&
        Object.keys(item).every((key) => key === 'field' || key === 'issue'),
    )
  );
}

function messageForStatus(status: number): string {
  return status >= 500 ? 'Ocorreu um erro interno.' : 'A requisição não pôde ser processada.';
}

function codeForStatus(status: number): string {
  return statusCodes[status] ?? `HTTP_${status}`;
}

function getCorrelationId(request: CorrelatedRequest, response: Response): string {
  const header = response.getHeader('x-correlation-id');
  return request.correlationId ?? (typeof header === 'string' ? header : randomUUID());
}

function buildDetails(payload: ExceptionPayload): ErrorDetail[] | undefined {
  if (validDetails(payload.details)) return payload.details;
  if (!Array.isArray(payload.message)) return undefined;
  const details = payload.message.filter(validDetails).flat();
  return details.length > 0 ? details : undefined;
}

@Catch()
export class ErrorFormatFilter implements ExceptionFilter<unknown> {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<CorrelatedRequest>();
    const correlationId = getCorrelationId(request, response);
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;
    let body: ErrorFormat;

    if (isHttpException) {
      const raw = exception.getResponse();
      const payload: ExceptionPayload = isRecord(raw) ? raw : { message: raw };
      const details = status === 400 ? buildDetails(payload) : undefined;
      const message = details
        ? 'Falha na validação dos dados.'
        : typeof payload.message === 'string'
          ? payload.message
          : messageForStatus(status);
      body = {
        code: details ? 'VALIDATION_FAILED' : codeForStatus(status),
        message: message.slice(0, 500),
        correlationId,
        status,
        ...(details ? { details } : {}),
      };
    } else {
      body = {
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno.',
        correlationId,
        status: 500,
      };
      const error = exception instanceof Error ? exception : new Error('Exceção desconhecida.');
      logger.error({ correlationId, err: { name: error.name, stack: error.stack } }, 'Erro não tratado na API.');
    }

    response.status(status).json(body);
  }
}
