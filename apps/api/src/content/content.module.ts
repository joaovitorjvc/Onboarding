import { Module } from '@nestjs/common';
import { CacheControlInterceptor, CONTENT_CACHE_MAX_AGE_SECONDS } from './cache-control.interceptor';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    CacheControlInterceptor,
    {
      provide: CONTENT_CACHE_MAX_AGE_SECONDS,
      useFactory: (): number => Number.parseInt(process.env.CONTENT_CACHE_MAX_AGE_SECONDS ?? '300', 10),
    },
  ],
  exports: [ContentService],
})
export class ContentModule {}
