import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { exitCodeFor, formatViolations, runChecks } from './run-checks.ts';
import type { NamedCheck, Violation } from './types.ts';

const violationArb = fc.record({
  file: fc.constantFrom('b.md', 'a.md', '.kiro/constitution.md'),
  requirement: fc.constantFrom('1.5', '2.6', '3.5'),
  message: fc.constantFrom('erro', 'ausente', 'divergente'),
});

describe('saída do verificador', () => {
  it('formata cada violação com arquivo e requisito e calcula o código', () => {
    const violations: Violation[] = [{ file: 'x.md', requirement: '2.6', message: 'modo inválido' }];
    expect(formatViolations(violations)).toBe('x.md (Req. 2.6): modo inválido');
    expect(exitCodeFor([])).toBe(0);
    expect(exitCodeFor(violations)).toBe(1);
  });

  // Feature: project-standards, Property 24: Saída do verificador
  it('é determinística e independente da ordem das checagens', () => {
    fc.assert(
      fc.property(fc.array(violationArb, { maxLength: 20 }), (violations) => {
        const first: NamedCheck = {
          name: 'primeira',
          run: () => violations.slice(0, Math.ceil(violations.length / 2)),
        };
        const second: NamedCheck = { name: 'segunda', run: () => violations.slice(Math.ceil(violations.length / 2)) };
        const normal = runChecks(
          {
            files: new Map(),
            paths: [],
            config: {
              legacyPaths: [],
              stacks: { web: '', api: '', ai: '', packages: '' },
              specMaxHours: 80,
              taskMaxHours: 8,
            },
          },
          [first, second],
        );
        const reversed = runChecks(
          {
            files: new Map(),
            paths: [],
            config: {
              legacyPaths: [],
              stacks: { web: '', api: '', ai: '', packages: '' },
              specMaxHours: 80,
              taskMaxHours: 8,
            },
          },
          [second, first],
        );
        expect(normal).toEqual(reversed);
        expect(exitCodeFor(normal)).toBe(violations.length > 0 ? 1 : 0);
        for (const line of formatViolations(normal).split('\n').filter(Boolean)) {
          expect(line).toMatch(/\S+ \(Req\. \S+\):/);
        }
      }),
      { numRuns: 100 },
    );
  });
});
