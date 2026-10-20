# ADR-0003: Ferramental do Monorepo

Última alteração: 2026-10-08 · Status: Aceito

## Contexto

O NuageHub reúne TypeScript, React, NestJS e módulos Python. O ferramental precisa ser reprodutível, compatível com os esqueletos existentes e integrado aos comandos da raiz.

## Decisão

Adotar as versões reais já instaladas no repositório:

| Área                   | Ferramenta e versão                      | Decisão                                                                         |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| Runtime                | Node.js 24 (`.nvmrc`)                    | Versão estável usada pelos CLIs e pelo type stripping nativo.                   |
| Gerenciador JavaScript | pnpm 10.34.6                             | Workspace único e lockfile único na raiz.                                       |
| Runtime Python         | Python 3.13 (`.python-version`)          | Runtime compatível com os módulos de IA.                                        |
| Dependências Python    | uv com lockfiles por módulo              | Sincronização reprodutível com `uv sync --locked`.                              |
| Lint/format TypeScript | ESLint 9.39.5 e Prettier 3.9.9           | Configuração única na raiz.                                                     |
| Tipos TypeScript       | TypeScript 5.9.3                         | `typescript-eslint` não suporta TypeScript 6.1+ ou 7 nesta base.                |
| React                  | React 19.3.0 e Vite 8.3.4                | App_Web com Vitest 5.0.3.                                                       |
| API                    | NestJS 11.2.7                            | Desvio de NestJS 12 por compatibilidade com `@nestjs/swagger` e TypeScript 5.9. |
| Acessibilidade         | `axe-core` 4.14.0 direto                 | Desvio de `vitest-axe`, que não faz parte da instalação atual.                  |
| Python                 | Ruff 0.13.1 e mypy 1.18.2                | Lint, formatação e análise estática.                                            |
| Testes                 | Vitest 5.0.3, Jest 30.5.2 e pytest 8.4.2 | Uma ferramenta por stack conforme a Constituição.                               |
| Hooks Git              | lefthook 2.2.1 e commitlint 21.2.3       | Hooks locais e validação de Conventional Commits.                               |

As versões de produção e desenvolvimento permanecem fixadas nos `package.json` e nos lockfiles existentes. Não foram adicionadas dependências nesta alteração.

## Consequências

O ferramental permanece alinhado ao estado instalado e pode ser reproduzido em CI. Os desvios de versões planejadas ficam explícitos: ESLint 9.39.5 em vez de 10, NestJS 11 em vez de 12, TypeScript 5.9.3, `axe-core` direto em vez de `vitest-axe` e pnpm 10.34.6.
