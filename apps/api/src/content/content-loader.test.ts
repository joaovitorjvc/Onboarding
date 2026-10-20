import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ContentValidationError, loadPages } from './content-loader';

describe('loadPages', () => {
  it('carrega os quatro arquivos reais na ordem do diretório', () => {
    const pages = loadPages();
    expect(pages).toHaveLength(4);
    expect(pages.map((page) => page.slug)).toEqual(['inicio', 'plataformas', 'playbook', 'primeiros-passos']);
  });

  it('informa o arquivo e o campo quando o conteúdo é inválido', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nuagehub-content-'));
    await writeFile(join(directory, 'inicio.json'), JSON.stringify({ slug: 'inicio' }), 'utf8');

    expect(() => loadPages(directory)).toThrow(ContentValidationError);
    expect(() => loadPages(directory)).toThrow(/inicio\.json: \/documentTitle/);
  });

  it('informa o arquivo quando o slug não coincide com o nome', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nuagehub-content-'));
    const source = loadPages()[0];
    if (!source) throw new Error('Fixture sem página inicial.');
    await writeFile(join(directory, 'outro.json'), JSON.stringify(source), 'utf8');

    expect(() => loadPages(directory)).toThrow(/outro\.json: \/slug/);
  });

  it('rejeita IDs de checklist duplicados', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nuagehub-content-'));
    const source = structuredClone(loadPages()[0]);
    if (!source) throw new Error('Fixture sem página inicial.');
    const checklist = source.blocks.find((block) => block.type === 'checklist');
    if (!checklist || checklist.type !== 'checklist') throw new Error('Fixture sem checklist.');
    const firstItem = checklist.items[0];
    const secondItem = checklist.items[1];
    if (!firstItem || !secondItem) throw new Error('Checklist sem itens suficientes.');
    secondItem.id = firstItem.id;
    await writeFile(join(directory, 'inicio.json'), JSON.stringify(source), 'utf8');

    expect(() => loadPages(directory)).toThrow(/IDs de checklist duplicados/);
  });

  it('rejeita uma lista com slug duplicado quando o diretório fornece a mesma página duas vezes', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nuagehub-content-'));
    const sourcePage = loadPages()[0];
    if (!sourcePage) throw new Error('Fixture sem página inicial.');
    const source = JSON.stringify(sourcePage);
    await mkdir(join(directory, 'nested'));
    await writeFile(join(directory, 'inicio.json'), source, 'utf8');
    await writeFile(join(directory, 'nested', 'inicio.json'), source, 'utf8');

    expect(() => loadPages(directory)).toThrow(/\/slug duplicado/);
  });
});
