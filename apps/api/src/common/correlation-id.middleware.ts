import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CorrelatedRequest = Request & { correlationId?: string };

export class CorrelationIdMiddleware {
  use(request: CorrelatedRequest, response: Response, next: NextFunction): void {
    const incoming = request.header('x-correlation-id');
    const correlationId = incoming && uuidPattern.test(incoming) ? incoming : randomUUID();
    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);
    next();
  }
}
