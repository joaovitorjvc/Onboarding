# Implementation Plan: legacy-migration

**Estimativa_de_Esforco:** 44h (Spec_Simples) · **Requisitos:** [requirements.md](./requirements.md) · **Design:** [design.md](./design.md)

## Overview

Ordem: contrato → App_API (dados e endpoints) → App_Web (rotas, cliente, blocos, checklist, ícones e fonte) → Baseline_Visual e testes de ponta a ponta → checkpoint com o usuário → remoção do Site_Legado. O Site_Legado continua intocado até a tarefa 6.1, que só começa após a aprovação do checkpoint 5.

## Tasks

- [x] 1. Contrato_de_Conteudo
  - [x] 1.1 Criar o schema e os utilitários do Conteudo_de_Pagina
    - `packages/contracts/schemas/page-content.schema.json`, geração de `src/generated/page-content.ts`, `src/page-content.ts` com `ICON_NAMES`, `isPageContent`, `parsePageContent` e `serializePageContent`, exportados em `src/index.ts`
    - _Requirements: 3.6, 6.4_
    - _Depends: -_
    - _Stack: contracts · Est: 3h_
  - [x]* 1.2 Escrever os testes de propriedade do contrato
    - **Property 1: Round-trip do Conteudo_de_Pagina** e **Property 2: Guarda de tipo equivalente ao schema**, com gerador derivado do schema em `src/test-support/page-content.arbitrary.ts`
    - **Validates: Requirements 3.6, 3.7, 6.4**
    - _Depends: 1.1_
    - _Stack: contracts · Est: 1h_

- [x] 2. Conteúdo no App_API
  - [x] 2.1 Transcrever o conteúdo das quatro páginas
    - `apps/api/src/content/data/{inicio,primeiros-passos,plataformas,playbook}.json`, válidos no schema e sem perda de texto, links ou ícones
    - _Requirements: 3.2, 3.5_
    - _Depends: 1.1_
    - _Stack: api · Est: 4h_
  - [x] 2.2 Implementar o módulo de conteúdo
    - `content-loader.ts` (ajv, falha encerra a inicialização), `content.service.ts`, `content.controller.ts` (`@Public`), `CacheControlInterceptor`, `CONTENT_CACHE_MAX_AGE_SECONDS` em `config/env.ts`, CORS, OpenAPI dos endpoints, `assets` no `nest-cli.json`, `.env.example` e README
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.8_
    - _Depends: 2.1_
    - _Stack: api · Est: 3h_
  - [x]* 2.3 Escrever os testes de propriedade e de exemplo da API de conteúdo
    - **Property 7: Slug desconhecido vira 404 no Formato_de_Erro**; loader com arquivo inválido; `Cache-Control`; CORS
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.8**
    - _Depends: 2.2_
    - _Stack: api · Est: 1h_
  - [x] 2.4 Escrever o teste de paridade de texto com o Site_Legado
    - `apps/api/src/content/legacy-parity.test.ts`
    - _Requirements: 3.5, 10.2_
    - _Depends: 2.1_
    - _Stack: api · Est: 1.5h_
  - [x] 2.5 Regenerar o OpenAPI e os tipos de contrato
    - `openapi:export`, `contracts generate` e `contracts check` sem diff
    - _Requirements: 3.6_
    - _Depends: 2.2_
    - _Stack: contracts · Est: 0.5h_

- [x] 3. App_Web
  - [x] 3.1 Implementar rotas, redirecionamentos, 404 e Layout_Comum
    - Dependências exatas (`react-router`, `lucide-react`, `@fontsource/inter`, `@playwright/test`); `route-table.ts` com `resolveRoute`; `App.tsx`/`routes.tsx`; `Layout`, `Header`, `Footer`, `SkipLink`; `NotFoundPage`; título e foco na troca de rota
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 8.3, 8.4_
    - _Depends: 1.1_
    - _Stack: web · Est: 3h_
  - [x]* 3.2 Escrever o teste de propriedade da resolução de rotas
    - **Property 3: Resolução de rotas**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - _Depends: 3.1_
    - _Stack: web · Est: 0.5h_
  - [x] 3.3 Implementar o content-client, o `usePage` e os estados de carregamento e erro
    - Cache em memória por sessão, promise compartilhada, validação com `parsePageContent`, erro com `correlationId` e "Tentar novamente"
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
    - _Depends: 2.5, 3.1_
    - _Stack: web · Est: 2.5h_
  - [x] 3.4 Implementar `RichText`, os componentes de bloco e os estilos portados
    - Um componente e um `*.module.css` por bloco do design, portados do `css/styles.css` com as mesmas media queries; links externos acessíveis; teste estático sem cores literais e sem `dangerouslySetInnerHTML`
    - _Requirements: 3.5, 4.5, 4.6, 7.1, 7.2, 7.5, 8.2_
    - _Depends: 3.1_
    - _Stack: web · Est: 6h_
  - [x]* 3.5 Escrever o teste de propriedade do texto rico
    - **Property 6: Texto rico nunca vira HTML**
    - **Validates: Requirements 4.5**
    - _Depends: 3.4_
    - _Stack: web · Est: 0.5h_
  - [x] 3.6 Implementar o Checklist_Inicial
    - `checklist-storage.ts`, `useChecklist`, `ChecklistPanel` compatível com a Chave_do_Checklist do `js/main.js`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
    - _Depends: 3.4_
    - _Stack: web · Est: 2h_
  - [x]* 3.7 Escrever os testes de propriedade do checklist
    - **Property 4: Checklist persistido igual ao exibido** e **Property 5: Leitura tolerante do checklist**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.7**
    - _Depends: 3.6_
    - _Stack: web · Est: 1h_
  - [x] 3.8 Implementar ícones e fonte locais e o tema global
    - `Icon.tsx` com `lucide-react`, `theme/fonts.ts` com `@fontsource/inter`, `global.css`, `applyTokens()`; teste sobre `dist/` sem origens de CDN
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 7.1_
    - _Depends: 3.1_
    - _Stack: web · Est: 2h_
  - [x] 3.9 Escrever os testes de páginas completas e acessibilidade
    - Cada Pagina_Migrada renderizada com os dados reais: axe-core sem violações, um `h1`, hierarquia de títulos, `navLabel` igual à navegação
    - _Requirements: 8.1, 8.2, 10.1_
    - _Depends: 2.1, 3.3, 3.4, 3.6, 3.8_
    - _Stack: web · Est: 1.5h_

- [x] 4. Baseline_Visual e testes de ponta a ponta
  - [x] 4.1 Configurar o Playwright e gerar a Baseline_Visual do Site_Legado
    - `playwright.config.ts`, `e2e/serve-legacy.mjs`, projeto `legacy-baseline`, capturas em 375, 768 e 1280 px versionadas
    - _Requirements: 7.3_
    - _Depends: 3.8_
    - _Stack: web · Est: 2h_
  - [x] 4.2 Escrever os testes visuais e de ponta a ponta
    - Projetos `visual` (`maxDiffPixelRatio: 0.02`) e `e2e` (rotas, URLs_Legadas, 404, checklist com semente legada, teclado, axe-core)
    - _Requirements: 7.4, 10.3_
    - _Depends: 2.2, 3.9, 4.1_
    - _Stack: web · Est: 2.5h_
  - [x] 4.3 Adicionar o job `e2e` ao Pipeline_CI
    - Filtro de caminhos, imagem do Playwright, artefatos de diferença visual
    - _Requirements: 10.4_
    - _Depends: 4.2_
    - _Stack: repo · Est: 1h_

- [ ] 5. Checkpoint - Aprovação antes da remoção
  - Rodar `pnpm standards:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` e os testes de ponta a ponta.
  - Pedir ao usuário a checagem manual das quatro Paginas_Migradas (`pnpm dev`) e a aprovação da remoção (Req. 9.1).

- [ ] 6. Remoção do Site_Legado
  - [ ] 6.1 Remover os arquivos e as referências do Site_Legado no repositório
    - `git rm` dos arquivos legados; `legacyPaths: []` em `standards.config.json`; ajustes em `.prettierignore`, `eslint.config.mjs` e `lefthook.yml`; Constituição, steering, `CLAUDE.md`, `README.md`, backlog e `docs/adr/0005-conclusao-da-migracao-do-legado.md`
    - _Requirements: 9.1, 9.2, 9.4, 9.5_
    - _Depends: 4.3_
    - _Stack: repo · Est: 2h_
  - [ ] 6.2 Adaptar o Verificador_de_Padroes à remoção
    - `legacyListsCheck` aceita lista vazia sem `exclude`; teste de hash vira teste de ausência; `legacy-baseline.json` removido
    - _Requirements: 9.2, 9.3_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1h_
  - [ ] 6.3 Adaptar os testes do App_Web à remoção
    - `tokens.test.ts` sem leitura de `css/styles.css`; projeto `legacy-baseline` e `serve-legacy.mjs` removidos
    - _Requirements: 9.3, 9.6_
    - _Depends: 6.1_
    - _Stack: web · Est: 0.5h_
  - [ ] 6.4 Remover o teste de paridade de texto da API
    - `legacy-parity.test.ts` removido
    - _Requirements: 9.3_
    - _Depends: 6.1_
    - _Stack: api · Est: 0.25h_

- [ ] 7. Checkpoint final
  - Rodar `pnpm standards:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` e os testes visuais e de ponta a ponta; confirmar que não existe arquivo legado na raiz.

## Notes

- Tarefas com `*` são opcionais (só testes), mas entram na execução padrão.
- Soma das estimativas: 42,25 h, dentro dos 44 h da Spec.
- As tarefas que instalam dependências JS (3.1 e 2.2, que move o `ajv` para dependência de runtime) não rodam em paralelo, para evitar escrita concorrente no `pnpm-lock.yaml`.
