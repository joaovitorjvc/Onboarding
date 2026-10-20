import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';
import openapiTS, { astToString } from 'openapi-typescript';
import { format } from 'prettier';

type GeneratedFile = { path: string; content: string };

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(scriptDirectory, '..');
const rootDirectory = resolve(packageDirectory, '../..');
const schemaPath = join(packageDirectory, 'schemas/error-format.schema.json');
const generatedDirectory = join(packageDirectory, 'src/generated');
const errorFormatPath = join(generatedDirectory, 'error-format.ts');
const openApiPath = join(packageDirectory, 'openapi/api.json');
const apiTypesPath = join(generatedDirectory, 'api.ts');
const pageContentSchemaPath = join(packageDirectory, 'schemas/page-content.schema.json');
const pageContentPath = join(generatedDirectory, 'page-content.ts');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function formatTypeScript(source: string): Promise<string> {
  const prettierConfig = JSON.parse(await readFile(join(rootDirectory, '.prettierrc.json'), 'utf8')) as Record<
    string,
    unknown
  >;
  return format(source, { filepath: 'generated.ts', ...prettierConfig });
}

async function generateErrorFormat(): Promise<GeneratedFile> {
  const schema = JSON.parse(await readFile(schemaPath, 'utf8')) as Parameters<typeof compile>[0];
  const source = await compile(schema, 'ErrorFormat', {
    bannerComment: '/* eslint-disable */\n/** Gerado por packages/contracts/scripts/generate.mts. */',
    format: false,
    additionalProperties: false,
    unknownAny: false,
  });
  return { path: errorFormatPath, content: await formatTypeScript(source) };
}

async function generatePageContent(): Promise<GeneratedFile> {
  const schema = JSON.parse(await readFile(pageContentSchemaPath, 'utf8')) as Parameters<typeof compile>[0];
  const source = await compile(schema, 'PageContent', {
    bannerComment: '/* eslint-disable */\n/** Gerado por packages/contracts/scripts/generate.mts. */',
    format: false,
    additionalProperties: false,
    unknownAny: false,
  });
  return { path: pageContentPath, content: await formatTypeScript(source) };
}

async function generateApiTypes(): Promise<GeneratedFile | null> {
  if (!(await exists(openApiPath))) return null;
  const document = JSON.parse(await readFile(openApiPath, 'utf8')) as Parameters<typeof openapiTS>[0];
  const ast = await openapiTS(document);
  return { path: apiTypesPath, content: await formatTypeScript(astToString(ast)) };
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check');
  if (!checkOnly) await mkdir(generatedDirectory, { recursive: true });
  const generated = [await generateErrorFormat(), await generatePageContent(), await generateApiTypes()].filter(
    (file): file is GeneratedFile => file !== null,
  );
  const differences: string[] = [];

  for (const file of generated) {
    const current = (await exists(file.path)) ? await readFile(file.path, 'utf8') : null;
    if (current !== file.content) differences.push(file.path);
    if (!checkOnly) {
      await writeFile(file.path, file.content, 'utf8');
    }
  }

  if (checkOnly && differences.length > 0) {
    console.error(`Artefatos gerados desatualizados: ${differences.join(', ')}`);
    process.exitCode = 1;
  }
}

await main();
