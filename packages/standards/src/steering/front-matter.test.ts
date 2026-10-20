import { describe, expect, it } from 'vitest';
import { parseFrontMatter } from './front-matter.ts';

describe('parser de front matter', () => {
  it('lê campos escalares e listas', () => {
    const result = parseFrontMatter(
      'steering.md',
      '---\ninclusion: fileMatch\nname: react\npaths:\n  - apps/web/**\n---\nregra',
    );
    expect(result.errors).toEqual([]);
    expect(result.frontMatter.inclusion).toBe('fileMatch');
    expect(result.frontMatter.name).toBe('react');
    expect(result.frontMatter.paths).toEqual(['apps/web/**']);
    expect(result.body).toBe('regra');
  });

  it('transforma YAML inválido em violação com a linha', () => {
    const result = parseFrontMatter('steering.md', '---\ninclusion: [fileMatch\n---\nregra');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain('steering.md');
    expect(result.errors[0]?.message).toMatch(/linha \d+/);
  });
});
