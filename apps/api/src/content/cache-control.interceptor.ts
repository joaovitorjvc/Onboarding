import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Response } from 'express';

export const CONTENT_CACHE_MAX_AGE_SECONDS = Symbol('CONTENT_CACHE_MAX_AGE_SECONDS');

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(@Inject(CONTENT_CACHE_MAX_AGE_SECONDS) private readonly maxAge: number) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('Cache-Control', `public, max-age=${this.maxAge}`);
    return next.handle();
  }
}
