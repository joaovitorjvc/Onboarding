import 'reflect-metadata';
import { Body, Controller, Get, Post } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { AppModule } from './app.module';
import { Public } from './common/public.decorator';
import { createValidationPipe } from './common/validation';
import { setupSwagger } from './main';

class TestRequestDto {
  @IsString()
  @MinLength(3)
  value!: string;
}

@Controller('test')
class TestController {
  @Get('private')
  privateRoute(): { ok: boolean } {
    return { ok: true };
  }

  @Public()
  @Post('validation')
  validationRoute(@Body() body: TestRequestDto): TestRequestDto {
    return body;
  }
}

describe('App API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule], controllers: [TestController] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('expõe health público com correlação ecoada', async () => {
    const correlationId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-correlation-id', correlationId)
      .expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-correlation-id']).toBe(correlationId);
  });

  it('nega rota não pública com Formato_de_Erro', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/test/private').expect(401);
    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED', status: 401 });
    expect(response.body.correlationId).toEqual(expect.any(String));
  });

  it('normaliza corpo inválido como VALIDATION_FAILED', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/test/validation')
      .send({ value: 'x', unexpected: true })
      .expect(400);
    expect(response.body).toMatchObject({ code: 'VALIDATION_FAILED', status: 400 });
    expect(response.body.details).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'value' })]));
    expect(response.body.details).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'unexpected' })]));
  });
});
