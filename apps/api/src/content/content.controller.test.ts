import 'reflect-metadata';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import fc from 'fast-check';
import request from 'supertest';
import errorSchema from '../../../../packages/contracts/schemas/error-format.schema.json';
import { isPageContent, PAGE_SLUGS } from '@nuagehub/contracts';
import { AppModule } from '../app.module';
import { createValidationPipe } from '../common/validation';
import { setupSwagger } from '../main';

const knownSlugs = new Set<string>(PAGE_SLUGS);

describe('ContentController (e2e)', () => {
  let app: INestApplication;
  const validateError = new Ajv2020({ strict: false });

  beforeAll(async () => {
    addFormats(validateError);
    validateError.compile(errorSchema);
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: 'http://localhost:5173' });
    app.useGlobalPipes(createValidationPipe());
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lista páginas na ordem canônica e retorna conteúdo com cache', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/content/pages').expect(200);
    expect(list.body.map((page: { slug: string }) => page.slug)).toEqual([
      'inicio',
      'primeiros-passos',
      'plataformas',
      'playbook',
    ]);

    const page = await request(app.getHttpServer()).get('/api/v1/content/pages/plataformas').expect(200);
    expect(isPageContent(page.body)).toBe(true);
    expect(page.headers['cache-control']).toBe('public, max-age=300');
  });

  // Feature: legacy-migration, Property 7: Slug desconhecido vira 404 no Formato_de_Erro
  it('responde Property 7 para slugs desconhecidos e conhecidos', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z0-9-]{1,20}$/u).filter((slug) => !knownSlugs.has(slug)),
        async (slug) => {
          const response = await request(app.getHttpServer()).get(`/api/v1/content/pages/${encodeURIComponent(slug)}`);
          expect(response.status).toBe(404);
          const valid = validateError.validate(errorSchema, response.body);
          expect(valid).toBe(true);
          expect(response.body.code).toBe('NOT_FOUND');
        },
      ),
      { numRuns: 100 },
    );

    for (const slug of PAGE_SLUGS) {
      const response = await request(app.getHttpServer()).get(`/api/v1/content/pages/${slug}`).expect(200);
      expect(isPageContent(response.body)).toBe(true);
      expect(response.headers['cache-control']).toContain('max-age=300');
    }
  });

  it('aplica CORS à origem configurada', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/content/pages')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
