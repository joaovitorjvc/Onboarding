import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { createValidationPipe } from './common/validation';
import { logger } from './common/logger';

const nodeRequire = createRequire(__filename);

type JsonObject = Record<string, unknown>;

function contractSchemaPath(fileName: string): string {
  try {
    return nodeRequire.resolve(`@nuagehub/contracts/schemas/${fileName}`);
  } catch {
    const entry = nodeRequire.resolve('@nuagehub/contracts');
    return resolve(dirname(entry), '..', 'schemas', fileName);
  }
}

function convertSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(convertSchema);
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' && value.startsWith('#/$defs/')
      ? value.replace('#/$defs/', '#/components/schemas/')
      : value;
  }

  const converted: JsonObject = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === '$defs' || key === '$schema' || key === '$id') continue;
    converted[key] = convertSchema(child);
  }
  return converted;
}

function readContractSchema(fileName: string): JsonObject {
  return JSON.parse(readFileSync(contractSchemaPath(fileName), 'utf8')) as JsonObject;
}

export function setupSwagger(app: INestApplication): ReturnType<typeof SwaggerModule.createDocument> {
  const config = new DocumentBuilder()
    .setTitle('NuageHub API')
    .setDescription('API do portal de onboarding do NuageHub.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const pageSchema = readContractSchema('page-content.schema.json');
  const errorSchema = readContractSchema('error-format.schema.json');
  const pageDefinitions = (pageSchema.$defs ?? {}) as JsonObject;
  const components = document.components ?? {};
  components.schemas = {
    ...(components.schemas ?? {}),
    ErrorFormat: convertSchema(errorSchema) as SchemaObject,
    PageContent: convertSchema(pageSchema) as SchemaObject,
    ...Object.fromEntries(Object.entries(pageDefinitions).map(([name, schema]) => [name, convertSchema(schema)])),
  };
  document.components = components;
  SwaggerModule.setup('api/docs', app, document);
  return document;
}

export async function bootstrap(): Promise<void> {
  const config = loadEnv(process.env);
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: config.API_CORS_ORIGIN });
  app.useGlobalPipes(createValidationPipe());
  setupSwagger(app);
  await app.listen(config.API_PORT);
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Falha desconhecida ao iniciar a API.';
    logger.error(
      {
        err: {
          name: error instanceof Error ? error.name : 'Error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      'Falha no bootstrap.',
    );
    console.error(message);
    process.exit(1);
  });
}
