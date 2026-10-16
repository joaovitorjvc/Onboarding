import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { decide } from './decide.ts';
import { scan, type Finding } from './scan.ts';
import { blockingExampleArbitrary, blockingExamples, safeCorpusArbitrary } from '../../test/arbitraries/security.ts';

describe('scanner de segurança', () => {
  it.each(
    blockingExamples.map((example) => [example.category, example.snippet, `arquivo.${example.extension}`] as const),
  )('encontra o bloqueante %s', (category, snippet, filePath) => {
    const findings = scan(filePath, snippet);
    expect(findings.some((finding) => finding.category === category && finding.severity === 'blocking')).toBe(true);
    expect(findings.find((finding) => finding.category === category)?.line).toBe(1);
  });

  it('encontra alertas sem bloqueio', () => {
    const insecure = ['pickle', '.', 'loads(data)'].join('');
    const tls = ['rejectUnauthorized', ': false'].join('');
    const cors = ['origin', ': "*"'].join('');
    const crypto = ['createHash("', 'md5")'].join('');
    const findings = scan('arquivo.py', [insecure, tls, cors, crypto].join('\n'));
    expect(new Set(findings.map((finding) => finding.category))).toEqual(
      new Set(['insecure-deserialization', 'tls-verification-disabled', 'permissive-cors', 'weak-crypto']),
    );
    expect(findings.every((finding) => finding.severity === 'warning')).toBe(true);
  });

  it('ignora placeholders, .env.example e arquivos binários', () => {
    const secret = ['AK', 'IA', '1234567890ABCDEF'].join('');
    expect(scan('.env.example', `TOKEN=${secret}`)).toEqual([]);
    expect(scan('config.ts', 'const token = "<TOKEN_AQUI>";')).toEqual([]);
    expect(scan('imagem.bin', `texto\0${secret}`)).toEqual([]);
  });

  it('aponta arquivo, linha, categoria e sugestão na decisão bloqueante', () => {
    const findings = scan('src/arquivo.ts', `linha segura\n${blockingExamples[0]?.snippet ?? ''}`);
    const decision = decide(findings);
    expect(decision.kind).toBe('block');
    if (decision.kind === 'block') {
      expect(decision.stderr).toContain('src/arquivo.ts:2 [hardcoded-secret]');
      expect(decision.stderr.length).toBeGreaterThan(20);
    }
  });

  it('trata tamanho e supressão inválida', () => {
    const tooLarge = scan('grande.txt', 'x'.repeat(1024 * 1024 + 1));
    expect(tooLarge[0]?.category).toBe('file-too-large');
    const invalid = scan('arquivo.ts', `// security-ignore: dynamic-eval\n${['ev', 'al('].join('')}entrada)`);
    expect(invalid.map((finding) => finding.category)).toEqual(['invalid-suppression', 'dynamic-eval']);
  });

  // Feature: project-standards, Property 8: Detecção de Achado_Bloqueante na linha correta
  it('encontra qualquer trecho bloqueante na linha em que foi inserido', () => {
    fc.assert(
      fc.property(safeCorpusArbitrary, blockingExampleArbitrary, (before, example) => {
        const content = [...before, example.snippet, 'linha segura'].join('\n');
        const findings = scan(`arquivo.${example.extension}`, content);
        const match = findings.find((finding) => finding.category === example.category);
        expect(match?.line).toBe(before.length + 1);
        expect(match?.severity).toBe('blocking');
        const decision = decide(findings);
        expect(decision.kind).toBe('block');
      }),
      { numRuns: 100 },
    );
  });

  // Feature: project-standards, Property 9: Classificação da decisão
  it('classifica toda lista de achados de modo determinístico', () => {
    const arbitraryFinding = fc.record({
      filePath: fc.constant('arquivo.ts'),
      line: fc.integer({ min: 1, max: 100 }),
      category: fc.constantFrom<Finding['category']>('dynamic-eval', 'weak-crypto'),
      severity: fc.constantFrom<Finding['severity']>('blocking', 'warning'),
      ruleId: fc.constant('teste'),
      suggestion: fc.constant('Corrija o trecho.'),
    });
    fc.assert(
      fc.property(fc.array(arbitraryFinding, { maxLength: 8 }), (findings) => {
        const decision = decide(findings);
        if (findings.length === 0) expect(decision.kind).toBe('allow');
        else if (findings.some((finding) => finding.severity === 'blocking')) expect(decision.kind).toBe('block');
        else expect(decision.kind).toBe('ask');
        expect(decide(findings)).toEqual(decision);
      }),
      { numRuns: 100 },
    );
    fc.assert(
      fc.property(safeCorpusArbitrary, (lines) => {
        expect(scan('seguro.ts', lines.join('\n'))).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: project-standards, Property 11: Supressão inline restrita à categoria justificada
  it('suprime apenas a categoria justificada na mesma linha ou na anterior', () => {
    fc.assert(
      fc.property(blockingExampleArbitrary, fc.boolean(), (example, previousLine) => {
        const marker = `// security-ignore: ${example.category} -- falso positivo documentado`;
        const lines = previousLine ? [marker, example.snippet] : [`${example.snippet} ${marker}`];
        const findings = scan(`arquivo.${example.extension}`, lines.join('\n'));
        expect(findings.filter((finding) => finding.category === example.category)).toEqual([]);
      }),
      { numRuns: 100 },
    );
    const snippet = blockingExamples.find((example) => example.category === 'dynamic-eval')?.snippet ?? '';
    const wrong = scan('arquivo.ts', [`// security-ignore: sql-injection -- motivo`, snippet].join('\n'));
    expect(wrong.some((finding) => finding.category === 'dynamic-eval')).toBe(true);
  });

  it('mantém a análise do scanner linear em entrada adversarial de 1 MB', () => {
    const adversarial = ('SELECT ' + 'x '.repeat(1024 * 512)).slice(0, 1024 * 1024);
    const started = Date.now();
    const findings = scan('adversarial.sql', adversarial);
    expect(Date.now() - started).toBeLessThan(5000);
    expect(findings).toBeInstanceOf(Array);
  });
});
