import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PageContent } from '@nuagehub/contracts';
import { Public } from '../common/public.decorator';
import { CacheControlInterceptor } from './cache-control.interceptor';
import { ContentService, type PageSummary } from './content.service';

const pageContentReference = { $ref: '#/components/schemas/PageContent' };
const errorFormatReference = { $ref: '#/components/schemas/ErrorFormat' };

@ApiTags('content')
@Controller('content/pages')
@UseInterceptors(CacheControlInterceptor)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista as páginas de conteúdo na ordem de navegação.' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['slug', 'navLabel', 'documentTitle'],
        properties: {
          slug: { type: 'string', enum: ['inicio', 'primeiros-passos', 'plataformas', 'playbook'] },
          navLabel: { type: 'string' },
          documentTitle: { type: 'string' },
        },
      },
    },
  })
  list(): PageSummary[] {
    return this.contentService.list();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Obtém uma página de conteúdo pelo slug.' })
  @ApiOkResponse({ schema: pageContentReference })
  @ApiNotFoundResponse({ schema: errorFormatReference })
  get(@Param('slug') slug: string): PageContent {
    return this.contentService.get(slug);
  }
}
