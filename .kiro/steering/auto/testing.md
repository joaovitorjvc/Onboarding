---
inclusion: auto
name: testing-standards
description: Orienta testes unitários, de integração e baseados em propriedades nas stacks do NuageHub.
---

> Última alteração: 2026-10-20

# Padrões detalhados de testes

- Use Vitest no App_Web, Jest no App_API e pytest nos Modulos_IA; execute cada suíte em modo único e cubra todo critério de aceitação testável.
- Mantenha testes TypeScript ao lado do módulo sob teste, com `.test.ts` ou `.test.tsx`; mantenha testes Python em `tests/` com prefixo `test_`.
- Para cada propriedade do design, escreva um único teste de propriedade e inclua o comentário `// Feature: project-standards, Property N: <título>`; em Python use `# Feature: project-standards, Property N: <título>`.
- Use fast-check em TypeScript com `{ numRuns: 100 }` no mínimo e geradores em `packages/standards/test/arbitraries/{tema}.ts`, um arquivo por tema.
- Use Hypothesis em Python com `@settings(max_examples=100)` e geradores próximos ao teste ou no módulo de arbitrários correspondente.
- Adicione teste de regressão para todo bug corrigido e não reduza a cobertura mínima de 80% das linhas novas ou alteradas.
- Valide testes de contrato, round-trip, idempotência, acessibilidade e integração das stacks afetadas.
