# Implementation Plan: project-standards

**Estimativa_de_Esforco:** 76h (Spec_Simples) · **Requisitos:** [requirements.md](./requirements.md) · **Design:** [design.md](./design.md)

## Overview

O plano começa pelo teste de fumaça da Decisão D1. Ele confirma que o Kiro lê steering em subpastas e que o Claude Code resolve `@` relativo em `.claude/rules/`. Também captura os payloads reais dos hooks. Em seguida vêm a base do Monorepo, a Fonte_Canonica_de_Padroes e a paridade com o Claude Code. Depois, o Verificador_de_Padroes, os Scripts_de_Hook, os contratos, os esqueletos (API, Web, IA), a fiação dos comandos da raiz, os hooks Git, o CI e a documentação.

Linguagens: TypeScript (Node 24, type stripping) para `packages/*`, `apps/web` e `apps/api`; Python 3.13 para `services/ai/*` e `packages/contracts/python`. PBT com fast-check (TS) e Hypothesis (Python), no mínimo 100 iterações por propriedade.

Regra transversal: **nenhuma tarefa altera os arquivos do Site_Legado** (`index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/**`, `js/**`). Pendências que exigiriam alterá-los vão para `docs/legacy-migration-backlog.md` (Req. 18.4).

Formato dos metadados de cada tarefa (lido pelo `tasksGraphCheck`): sub-bullets `_Requirements: x.y_`, `_Depends: a.b, c.d_` (ou `_Depends: -_`) e `_Stack: {stack} · Est: {h}h_`. Stacks usadas: `repo` (raiz, `.kiro`, `.claude`, `.github`, `docs`; nenhuma aplicação), `standards`, `contracts`, `web`, `api`, `ai:example`.

## Tasks

- [x] 1. Teste de fumaça D1 e captura de payloads
  - [x] 1.1 Validar a leitura de steering em subpastas pelo Kiro
    - Criar `.kiro/steering/always/_probe.md` (`inclusion: always`) e `.kiro/steering/conditional/_probe.md` (`inclusion: fileMatch`, `fileMatchPattern: "apps/web/**"`), cada um com um token sentinela distinto
    - Pedir ao usuário que abra uma sessão nova do Kiro e pergunte pelos tokens (o conditional com um arquivo de `apps/web/` no contexto)
    - Registrar o resultado em `docs/adr/0002-steering-subfolders.md` (contexto, decisão, resultado do teste) e remover os probes
    - _Requirements: 2.1, 16.2_
    - _Depends: -_
    - _Stack: repo · Est: 1h_
  - [x] 1.2 Validar a importação `@` relativa em `.claude/rules/`
    - Criar `.claude/rules/_probe.md` com `paths: ["apps/web/**"]` e corpo `@../../.kiro/steering/conditional/_probe-claude.md`, apontando para um arquivo temporário com token sentinela
    - Pedir ao usuário que confirme no Claude Code se o token é carregado. Se não for, repetir com `@.kiro/...` a partir da raiz
    - Acrescentar o resultado (forma de caminho adotada) ao ADR-0002 e remover os arquivos temporários
    - _Requirements: 3.2_
    - _Depends: 1.1_
    - _Stack: repo · Est: 1h_
  - [x] 1.3 Capturar payloads reais de stdin dos hooks do Kiro e do Claude Code
    - Configurar temporariamente hooks `PreToolUse` (escrita, edição, append) e `PostTaskExec`/`Stop` que só gravam o stdin em `packages/standards/test/fixtures/hooks/{kiro,claude}-{evento}-{ferramenta}.json`
    - Pedir ao usuário que execute uma escrita, uma edição e um append em cada agente, e uma tarefa/parada
    - Remover segredos ou caminhos pessoais das fixtures e desfazer as configurações temporárias de `.kiro/hooks/` e `.claude/settings.json`
    - _Requirements: 4.4, 5.1, 5.2_
    - _Depends: -_
    - _Stack: repo · Est: 1h_

- [x] 2. Checkpoint D1 - Resultado do teste de fumaça
  - Se o Kiro **não** carregou os probes das subpastas, PARAR: voltar ao `requirements.md` com o usuário para ajustar o Req. 2.7 (isentar espelhos gerados) antes de ativar o fallback de espelho da D1. Só então replanejar as tarefas 4.x e 6.5.
  - Se a importação `@` relativa falhou, usar a forma a partir da raiz nas tarefas 5.1 e 6.7.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Base do Monorepo e ferramental
  - [x] 3.1 Criar os arquivos de base da raiz
    - `package.json` (privado, `packageManager` pnpm fixado, `engines`, e todos os scripts do design §5 já apontando para os CLIs que serão criados), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.npmrc` (`save-exact=true`), `.nvmrc` (24), `.python-version` (3.13), `.editorconfig` (2 espaços; 4 para `*.py`), `.env.example` e `standards.config.json` (design, Data Models)
    - Não alterar o `.gitattributes` existente
    - _Requirements: 7.7, 7.8, 8.3, 8.6, 8.7, 12.2, 12.3, 18.5_
    - _Depends: 1.1, 1.2, 1.3_
    - _Stack: repo · Est: 1.5h_
  - [x] 3.2 Criar `packages/config` e o esqueleto de `packages/standards`
    - `packages/config/tsconfig.base.json` (strict); `packages/standards/package.json` com todas as dependências do pacote em versão exata (vitest, fast-check, yaml, picomatch, @types/node); `tsconfig.json` com `erasableSyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSyntax`; `vitest.config.ts`; diretórios `src/` e `test/arbitraries/`
    - Gerar o `pnpm-lock.yaml` na raiz
    - _Requirements: 8.1, 8.3, 12.4, 14.1_
    - _Depends: 3.1_
    - _Stack: standards · Est: 1.5h_
  - [x] 3.3 Configurar lint e formatação de TypeScript e Python
    - `eslint.config.mjs` (flat config com typescript-eslint, react-hooks, jsx-a11y), `.prettierrc.json`, `.prettierignore`, `ruff.toml` (regras `E,F,I,N,UP,B,S,ANN`), `mypy.ini` (`strict`)
    - `ignores` do ESLint e `.prettierignore` com os mesmos `legacyPaths` do `standards.config.json`
    - _Requirements: 11.1, 11.2, 12.1, 12.4, 18.5_
    - _Depends: 3.1_
    - _Stack: repo · Est: 1h_
  - [x]* 3.4 Escrever teste de propriedade de idempotência do formatador
    - **Property 21: Idempotência do formatador**
    - Corpus real do Repositório fora do Site_Legado, com perturbações de espaçamento; Prettier para TS/JSON/MD e `ruff format` para Python
    - **Validates: Requirements 12.5**
    - _Depends: 3.3_
    - _Stack: standards · Est: 0.5h_

- [x] 4. Constituição e Arquivos_Steering
  - [x] 4.1 Escrever `.kiro/constitution.md`
    - Cabeçalho `Última alteração: AAAA-MM-DD` e seções `##` obrigatórias: Idioma, Segurança, Estrutura do Monorepo, Testes, Contratos entre aplicações (com o Formato_de_Erro), Git, Fluxo de Specs (requisitos → design → tarefas → implementação, limites de 80 h e 8 h, formato do `tasks.md`, revisão por documento, precedência da Constituicao)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 6.15, 6.16, 6.17, 13.2_
    - _Depends: 1.1, 1.2_
    - _Stack: repo · Est: 2h_
  - [x] 4.2 Escrever os Steering_Always
    - `always/constitution.md` (ponteiro `#[[file:.kiro/constitution.md]]`), `always/agent-protocol.md` (Req. 7), `always/repository-structure.md` (Req. 8 e exclusões do Site_Legado), `always/code-style.md` (Req. 12), cada um com front matter e data no cabeçalho
    - _Requirements: 1.3, 1.5, 2.1, 2.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 12.1, 16.3, 16.4, 18.4_
    - _Depends: 4.1_
    - _Stack: repo · Est: 1.5h_
  - [x] 4.3 Escrever os Steering_Auto
    - `auto/spec-workflow.md` (épicos, Sub_Funcionalidades, EARS, links ao épico), `auto/testing.md` (Req. 14, PBT), `auto/api-contracts.md` (Req. 13), `auto/git-workflow.md` (Req. 15), com `name` sem colisão com skills e `description`
    - _Requirements: 1.3, 1.5, 2.1, 2.3, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.12, 14.2, 14.3, 14.4, 14.6, 15.1, 15.2_
    - _Depends: 4.1_
    - _Stack: repo · Est: 1.5h_
  - [x] 4.4 Escrever os Steering_Conditional e Steering_Manual
    - `conditional/react.md` (`apps/web/**`, Req. 9), `conditional/nestjs.md` (`apps/api/**`, Req. 10), `conditional/python-ai.md` (`services/ai/**`, Req. 11), `manual/adr.md` (template de ADR), `manual/security-review.md`
    - _Requirements: 1.3, 1.5, 2.1, 2.4, 2.5, 2.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8, 9.9, 9.10, 10.1, 10.2, 10.3, 10.7, 10.12, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
    - _Depends: 4.1_
    - _Stack: repo · Est: 2h_

- [x] 5. Paridade com o Claude Code
  - [x] 5.1 Criar `CLAUDE.md` e `.claude/rules/{react,nestjs,python-ai}.md`
    - `CLAUDE.md` só com o bloco `nav:start/nav:end`, cabeçalhos de navegação, importações `@` (Constituicao e Steering_Always) e referências sob demanda (Auto e Manual), conforme a gramática D3
    - Regras escopadas com `paths` iguais ao `fileMatchPattern` e corpo só com `@` relativo (`@../../.kiro/steering/conditional/{nome}.md`), forma validada em 1.2
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
    - _Depends: 1.2, 4.2, 4.3, 4.4_
    - _Stack: repo · Est: 1h_

- [x] 6. Verificador_de_Padroes
  - [x] 6.1 Implementar o núcleo e o CLI do verificador
    - `RepoSnapshot` (carregado de `git ls-files` + não rastreados, filtrado pelos caminhos do design §4), `Violation`, `Check`, `runChecks` (exceção de uma checagem vira violação `interno` sem interromper as demais)
    - `src/cli/check-standards.ts` com registro de checagens vazio, saída `{arquivo} (Req. {x.y}): {mensagem}` ordenada, exit 1 com violações
    - _Requirements: 17.4, 17.5, 17.6_
    - _Depends: 3.2_
    - _Stack: standards · Est: 1.5h_
  - [x]* 6.2 Escrever teste de propriedade da saída do verificador
    - **Property 24: Saída do verificador**
    - **Validates: Requirements 17.5**
    - _Depends: 6.1_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.3 Implementar o modelo de steering e as checagens de cabeçalho
    - Parser de front matter (YAML inválido vira violação com a linha), `SteeringFile` com `pointerTarget` e `lastModified`, `constitutionCheck` e `steeringHeaderCheck`, cada checagem em arquivo próprio
    - _Requirements: 1.1, 1.2, 1.5_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1.5h_
  - [x]* 6.4 Escrever teste de propriedade de cabeçalhos e seções
    - **Property 1: Cabeçalhos e seções dos documentos canônicos**
    - **Validates: Requirements 1.2, 1.5**
    - _Depends: 6.3_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.5 Implementar `steeringLayoutCheck` e `steeringScopeCheck`
    - `EXPECTED_MODE`, `effectiveMode`, campos obrigatórios por modo, arquivos na raiz de `.kiro/steering/`; existência de `react`/`nestjs`/`python-ai` em `conditional/` com glob dentro do caminho da stack
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
    - _Depends: 6.3_
    - _Stack: standards · Est: 1.5h_
  - [x]* 6.6 Escrever teste de propriedade do layout do steering
    - **Property 3: Consistência entre subpasta e front matter do steering**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
    - _Depends: 6.5_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.7 Implementar o parser do `ClaudeModel` e o `claudeParityCheck`
    - `src/claude/nav-text.ts`, gramática D3 (`invalidLines` com arquivo, linha e seção), normalização de `@` para caminho a partir da raiz (em `.claude/rules/`, exigir a forma relativa), resolução de ponteiros, igualdade de conjuntos por canal e paridade de globs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
    - _Depends: 6.3_
    - _Stack: standards · Est: 2h_
  - [x]* 6.8 Escrever teste de propriedade da igualdade de conjuntos do Claude
    - **Property 4: Igualdade de conjuntos de referência do Claude Code**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**
    - _Depends: 6.7_
    - _Stack: standards · Est: 0.5h_
  - [x]* 6.9 Escrever teste de propriedade da paridade de globs
    - **Property 5: Paridade de globs**
    - **Validates: Requirements 3.2, 3.6**
    - _Depends: 6.7_
    - _Stack: standards · Est: 0.5h_
  - [x]* 6.10 Escrever teste de propriedade da gramática do CLAUDE.md
    - **Property 6: CLAUDE.md contém somente navegação**
    - **Validates: Requirements 3.4, 3.7**
    - _Depends: 6.7_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.11 Implementar `specStructureCheck` e `epicLinkCheck`
    - Kebab-case, extração da estimativa por regex, `expectedFiles` (simples, épico, Sub_Funcionalidade) e links relativos ao épico
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 6.11_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1.5h_
  - [x]* 6.12 Escrever teste de propriedade da estrutura de Specs
    - **Property 15: Estrutura de Specs conforme a estimativa**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.11**
    - _Depends: 6.11_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.13 Implementar `parseTasks`, `formatTasks`, `findGraphIssues` e `tasksGraphCheck`
    - Aceitar o formato de metadados em sub-bullets usado neste `tasks.md` (`_Requirements_`, `_Depends_`, `_Stack · Est_`), incluindo o marcador opcional `*`; checkpoints e tarefas-pai sem metadados ficam fora do grafo
    - Violações: tarefa sem requisitos, `Est` > 8 h, mais de uma stack, dependência inexistente, ciclo
    - Atualizar a seção "Modelo de tarefas" do `design.md` para descrever esse formato
    - _Requirements: 6.13, 6.14_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1.5h_
  - [x]* 6.14 Escrever teste de propriedade do round-trip de tarefas
    - **Property 16: Round-trip do formato de tarefas**
    - **Validates: Requirements 6.13**
    - _Depends: 6.13_
    - _Stack: standards · Est: 0.5h_
  - [x]* 6.15 Escrever teste de propriedade de dependências e ciclos
    - **Property 17: Detecção de dependências inválidas e ciclos** (modelo de referência: Kahn)
    - **Validates: Requirements 6.14**
    - _Depends: 6.13_
    - _Stack: standards · Est: 0.5h_
  - [x] 6.16 Implementar `adrOnConstitutionChangeCheck` e a checagem das listas de legado
    - Opção `--changed-files` no CLI para o modo CI; checagem de que `standards.config.json`, `.prettierignore`, `eslint.config.mjs` e `lefthook.yml` têm os mesmos `legacyPaths` (arquivo ausente vira violação só se já for exigido pelo layout)
    - _Requirements: 1.6, 18.5_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1h_
  - [x]* 6.17 Escrever teste de propriedade do ADR obrigatório
    - **Property 2: ADR exigido em mudança da Constituição**
    - **Validates: Requirements 1.6**
    - _Depends: 6.16_
    - _Stack: standards · Est: 0.5h_

- [x] 7. Hook_Seguranca
  - [x] 7.1 Implementar o adaptador de eventos dos hooks
    - `src/hooks/adapter.ts` com `normalizeWrite` e `normalizeStop`, aliases de campos, reconstrução do conteúdo final (escrita, edição, `MultiEdit`, append) e `AdapterError`
    - Testes de contrato com as fixtures capturadas em 1.3
    - _Requirements: 4.4, 4.8_
    - _Depends: 1.3, 3.2_
    - _Stack: standards · Est: 1.5h_
  - [x]* 7.2 Escrever teste de propriedade da normalização de escrita
    - **Property 7: Normalização de escrita reconstrói o conteúdo final**
    - **Validates: Requirements 4.4**
    - _Depends: 7.1_
    - _Stack: standards · Est: 0.5h_
  - [x] 7.3 Implementar o scanner com as categorias bloqueantes
    - `src/security/rules.ts` e `scan()`: `hardcoded-secret`, `sql-injection`, `command-injection`, `dynamic-eval`, `unsafe-html`, com sugestões em pt-BR
    - Supressão `security-ignore: <categoria> -- <justificativa>` (mesma linha ou anterior) e alerta `invalid-suppression`; limite de 1 MB (`file-too-large`) e detecção de binário
    - Regex sem backtracking catastrófico
    - _Requirements: 4.4, 4.5, 4.9, 4.10_
    - _Depends: 3.2_
    - _Stack: standards · Est: 2.5h_
  - [x] 7.4 Implementar as categorias de alerta e `decide()`
    - `insecure-deserialization`, `tls-verification-disabled`, `permissive-cors`, `weak-crypto`; `decide` → `allow`/`block` (stderr `{arquivo}:{linha} [{categoria}] {sugestão}`)/`ask`
    - _Requirements: 4.5, 4.6, 4.7_
    - _Depends: 7.3_
    - _Stack: standards · Est: 1.5h_
  - [x]* 7.5 Escrever teste de propriedade da detecção bloqueante
    - **Property 8: Detecção de Achado_Bloqueante na linha correta**
    - **Validates: Requirements 4.4, 4.5**
    - _Depends: 7.4_
    - _Stack: standards · Est: 0.5h_
  - [x]* 7.6 Escrever teste de propriedade da classificação da decisão
    - **Property 9: Classificação da decisão**
    - **Validates: Requirements 4.5, 4.6, 4.7**
    - _Depends: 7.4_
    - _Stack: standards · Est: 0.5h_
  - [x]* 7.7 Escrever teste de propriedade da supressão inline
    - **Property 11: Supressão inline restrita à categoria justificada**
    - **Validates: Requirements 4.10**
    - _Depends: 7.4_
    - _Stack: standards · Est: 0.5h_
  - [x]* 7.8 Escrever teste de desempenho do scanner
    - Entrada adversarial de 1 MB concluída em menos de 5 s
    - _Requirements: 4.9_
    - _Depends: 7.4_
    - _Stack: standards · Est: 0.5h_
  - [x] 7.9 Implementar o CLI `pre-write-security` e o shim
    - `src/cli/pre-write-security.ts` com `--source kiro|claude|cli`, função pura `processWrite` (adaptador → scanner → decisão; qualquer erro vira `ask`), watchdog de 4 s (`scan-timeout`), saídas exit 0/2 e JSON `permissionDecision: ask`
    - Modo `--files` para CI (exit 1 com bloqueante, `::warning` para alertas)
    - `scripts/hooks/pre-write-security` em POSIX sh (`git rev-parse --show-toplevel` + `exec node`), executável
    - _Requirements: 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 17.1_
    - _Depends: 7.1, 7.4_
    - _Stack: standards · Est: 2h_
  - [x]* 7.10 Escrever teste de propriedade de payload malformado
    - **Property 10: Payload malformado vira confirmação**
    - **Validates: Requirements 4.8**
    - _Depends: 7.9_
    - _Stack: standards · Est: 0.5h_

- [x] 8. Hook_Validacao e paridade de hooks
  - [x] 8.1 Implementar `detectAffectedStacks`, `commandsFor` e `report`
    - Descarte de `legacyPaths`, mapeamento por stack, expansão de `packages/**` para as stacks dependentes, resultado ordenado e sem duplicatas; `report` com no máximo 40 linhas por falha
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 18.5_
    - _Depends: 3.2_
    - _Stack: standards · Est: 1.5h_
  - [x]* 8.2 Escrever teste de propriedade da detecção de stacks
    - **Property 12: Detecção de Stacks_Afetadas**
    - **Validates: Requirements 5.4, 5.9, 18.5**
    - _Depends: 8.1_
    - _Stack: standards · Est: 0.5h_
  - [x]* 8.3 Escrever teste de propriedade do relatório da validação
    - **Property 13: Relatório da validação**
    - Incluir testes de exemplo do mapeamento de `commandsFor`
    - **Validates: Requirements 5.5, 5.6, 5.7, 5.8, 5.9**
    - _Depends: 8.1_
    - _Stack: standards · Est: 0.5h_
  - [x] 8.4 Implementar o CLI `post-task-validation` e o shim
    - Lista de alterados via `git diff --name-only HEAD` + `git ls-files --others --exclude-standard`; execução por stack; erro de `git` ou ferramenta ausente vira verificação `setup`; `stop_hook_active` só reporta com exit 0; sem stacks, exit 0 imediato
    - `scripts/hooks/post-task-validation` em POSIX sh, executável
    - _Requirements: 5.3, 5.4, 5.8, 5.9_
    - _Depends: 8.1_
    - _Stack: standards · Est: 1.5h_
  - [x] 8.5 Criar o Agente_de_Projeto_Kiro, o `conditional-steering` e a configuração do Claude Code
    - `.kiro/agents/nuagehub.json`, `.kiro/settings/cli.json` e `.claude/settings.json`, conforme o design §3
    - `src/cli/conditional-steering.ts` (Steering_Conditional por arquivos alterados ou diretório citado no prompt) e o shim `scripts/hooks/conditional-steering`, com testes
    - _Requirements: 2.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
    - _Depends: 7.9, 8.4_
    - _Stack: repo · Est: 0.5h_
  - [x] 8.6 Implementar `hookParityCheck`
    - Conjuntos de Scripts_de_Hook referenciados em `.kiro/agents/nuagehub.json` (exceto `conditional-steering`) e em `.claude/settings.json`, triggers e matchers esperados, diferença simétrica na mensagem
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.10_
    - _Depends: 6.1_
    - _Stack: standards · Est: 1h_
  - [x]* 8.7 Escrever teste de propriedade da paridade de scripts
    - **Property 14: Paridade de Scripts_de_Hook**
    - **Validates: Requirements 4.3, 5.3, 5.10**
    - _Depends: 8.6_
    - _Stack: standards · Est: 0.5h_

- [x] 9. Checkpoint - Verificador e hooks
  - Rodar `pnpm --filter @nuagehub/standards test` e `pnpm --filter @nuagehub/standards typecheck`.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Contratos compartilhados
  - [x] 10.1 Criar `packages/contracts` com o Formato_de_Erro em TypeScript
    - `schemas/error-format.schema.json`, geração de `src/generated/error-format.ts` (json-schema-to-typescript), `src/error-format.ts` com `isErrorFormat`, `parse` e `serialize`; scripts `generate` e `check`; dependências exatas (incluindo `openapi-typescript`)
    - _Requirements: 13.1, 13.2, 13.4_
    - _Depends: 3.2_
    - _Stack: contracts · Est: 1.5h_
  - [x] 10.2 Gerar o pacote Python `nuagehub_contracts`
    - `packages/contracts/python/` com `pyproject.toml`, `uv.lock` e `nuagehub_contracts/error_format.py` gerado por datamodel-code-generator (Pydantic v2), com `parse`/`serialize`
    - _Requirements: 8.4, 13.2, 13.4_
    - _Depends: 10.1_
    - _Stack: contracts · Est: 1h_
  - [x]* 10.3 Escrever teste de propriedade do round-trip do Formato_de_Erro
    - **Property 22: Round-trip JSON do Formato_de_Erro** (fast-check em TS e Hypothesis em Python, mesmo gerador derivado do schema)
    - **Validates: Requirements 13.4**
    - _Depends: 10.2_
    - _Stack: contracts · Est: 0.5h_

- [x] 11. Esqueleto do App_API
  - [x] 11.1 Criar o esqueleto NestJS com configuração validada
    - `apps/api` com dependências exatas (NestJS, @nestjs/swagger, zod, pino, jest, fast-check), `tsconfig` strict, scripts `lint`/`typecheck`/`test`, `main.ts` com prefixo `api/v1` e Swagger em `/api/docs`
    - `config/env.ts` com zod: env inválida → mensagem citando cada variável e `process.exit(1)` antes do `listen`; variáveis documentadas em `.env.example` do app
    - _Requirements: 8.1, 8.8, 10.1, 10.8, 10.9, 10.10, 10.11, 14.1, 14.6_
    - _Depends: 3.3, 10.1_
    - _Stack: api · Est: 2h_
  - [x]* 11.2 Escrever teste de propriedade da validação de ambiente
    - **Property 19: Validação de variáveis de ambiente**
    - **Validates: Requirements 10.10, 10.11**
    - _Depends: 11.1_
    - _Stack: api · Est: 0.5h_
  - [x] 11.3 Implementar o `ErrorFormatFilter`, o `ValidationPipe` e o correlation-id
    - `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`, filtro global (400 `VALIDATION_FAILED` com `details`, `HttpException` mapeada, 500 `INTERNAL_ERROR` sem stack), middleware `x-correlation-id` e log estruturado com pino
    - _Requirements: 10.4, 10.5, 10.6, 13.2_
    - _Depends: 11.1_
    - _Stack: api · Est: 1.5h_
  - [x]* 11.4 Escrever teste de propriedade do mapeamento de exceções
    - **Property 18: Mapeamento de exceções da API para o Formato_de_Erro**
    - **Validates: Requirements 10.4, 10.5, 10.6**
    - _Depends: 11.3_
    - _Stack: api · Est: 0.5h_
  - [x] 11.5 Implementar o `AuthGuard` global e o módulo `health`
    - Decorator `@Public()`, guard que nega o que não for público, `health/health.controller.ts` e `health.service.ts` com `GET /api/v1/health` público
    - Testes: health retorna 200; rota de teste não pública retorna 401 no Formato_de_Erro
    - _Requirements: 8.8, 10.2, 10.3, 10.7, 10.12_
    - _Depends: 11.3_
    - _Stack: api · Est: 1h_
  - [x] 11.6 Implementar `openapi:export` e o README do App_API
    - Script que inicia o `AppModule` com `preview: true` e grava `packages/contracts/openapi/api.json`; `apps/api/README.md` com propósito, comandos, testes e variáveis
    - _Requirements: 8.5, 10.9, 13.1, 16.3_
    - _Depends: 11.5_
    - _Stack: api · Est: 1h_
  - [x] 11.7 Gerar os tipos OpenAPI em `packages/contracts`
    - `src/generated/api.ts` via `openapi-typescript`; script `check` que regenera e falha se houver diff
    - _Requirements: 13.1, 13.3_
    - _Depends: 10.1, 11.6_
    - _Stack: contracts · Est: 1h_

- [x] 12. Esqueleto do App_Web
  - [x] 12.1 Criar o esqueleto Vite + React com Tokens_de_Design
    - `apps/web` com dependências exatas (react, vite, vitest, @testing-library/react, vitest-axe, openapi-fetch, fast-check), `tsconfig` strict, scripts `lint`/`typecheck`/`test`
    - `src/app/App.tsx`, `src/features/home/HomePage.tsx` (texto pt-BR, foco visível, rótulos acessíveis), `src/components/`, `src/theme/tokens.ts` copiado de `:root` do `css/styles.css` (sem alterar o CSS legado)
    - _Requirements: 8.1, 8.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9, 9.10, 14.1, 14.6_
    - _Depends: 3.3, 10.1_
    - _Stack: web · Est: 2h_
  - [x]* 12.2 Escrever testes de tokens e acessibilidade do App_Web
    - Tokens iguais às variáveis de `css/styles.css`; `HomePage.test.tsx` com renderização e `vitest-axe` sem violações
    - _Requirements: 9.6, 9.9_
    - _Depends: 12.1_
    - _Stack: web · Est: 0.5h_
  - [x] 12.3 Implementar o cliente HTTP com `normalizeError` e o README do App_Web
    - `src/api/http-client.ts` com `openapi-fetch` tipado por `@nuagehub/contracts` e interceptação de erros via `normalizeError`; `apps/web/README.md`
    - _Requirements: 8.5, 9.7, 13.1, 13.5, 16.3_
    - _Depends: 11.7, 12.1_
    - _Stack: web · Est: 1.5h_
  - [x]* 12.4 Escrever teste de propriedade da normalização de erro no cliente
    - **Property 23: Normalização de erro no cliente web**
    - **Validates: Requirements 13.5**
    - _Depends: 12.3_
    - _Stack: web · Est: 0.5h_

- [x] 13. Esqueleto do Modulo_IA de exemplo
  - [x] 13.1 Criar `services/ai/example` com FastAPI
    - `pyproject.toml` e `uv.lock` (versões exatas; `nuagehub-contracts` como dependência de caminho; pytest, pytest-cov, hypothesis, mypy, ruff), layout `src/example/`, `GET /health`, middleware de correlation-id, handlers que retornam o Formato_de_Erro, `README.md`
    - Teste `tests/test_health.py`
    - _Requirements: 8.4, 8.5, 8.8, 11.1, 11.2, 11.3, 11.4, 11.6, 14.1, 14.6_
    - _Depends: 3.3, 10.2_
    - _Stack: ai:example · Est: 2h_
  - [x] 13.2 Implementar `provider_client.py`
    - Timeout por `AI_PROVIDER_TIMEOUT_SECONDS`, log estruturado com duração e resultado sem segredos, mapeamento de falha/timeout para `AI_PROVIDER_ERROR` (502) e `AI_PROVIDER_TIMEOUT` (504)
    - _Requirements: 11.6, 11.7, 11.8_
    - _Depends: 13.1_
    - _Stack: ai:example · Est: 1h_
  - [x]* 13.3 Escrever teste de propriedade do cliente de provedor
    - **Property 20: Cliente de provedor de IA: falhas tipadas e logs sem segredos** (Hypothesis)
    - **Validates: Requirements 11.7, 11.8**
    - _Depends: 13.2_
    - _Stack: ai:example · Est: 0.5h_

- [x] 14. Fiação dos comandos e do verificador
  - [x] 14.1 Implementar `run.ts` para os comandos padronizados da raiz
    - `dev`, `build`, `lint`, `typecheck`, `test` em todas as stacks ou só nas afetadas (`--affected[=base]`), reaproveitando `detectAffectedStacks` e `commandsFor`; `pnpm -r --filter` para JS e `uv run` por Modulo_IA; `dev` sobe web e api em paralelo
    - _Requirements: 8.6, 14.1_
    - _Depends: 8.1, 11.1, 12.1, 13.1_
    - _Stack: standards · Est: 1.5h_
  - [x] 14.2 Implementar `monorepoLayoutCheck` e registrar todas as checagens no CLI
    - Diretórios obrigatórios, lockfile único, `pyproject.toml` + `uv.lock` por módulo, README por app; registrar em `check-standards.ts` todas as checagens das tarefas 6.x e 8.6
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 17.4_
    - _Depends: 6.5, 6.7, 6.11, 6.13, 6.16, 8.6_
    - _Stack: standards · Est: 1.5h_
  - [x]* 14.3 Escrever testes de exemplo de layout, versões e preservação do legado
    - `monorepoLayoutCheck`; versões exatas em todos os `package.json`; localização dos testes; hash SHA-256 dos seis arquivos do Site_Legado igual ao do commit `8e043cf`; `standards:check` no próprio Repositório em menos de 30 s
    - _Requirements: 7.7, 14.6, 17.6, 18.2, 18.3_
    - _Depends: 14.2_
    - _Stack: standards · Est: 0.5h_

- [x] 15. Checkpoint - Verificação completa local
  - Rodar `pnpm standards:check`, `pnpm lint`, `pnpm typecheck` e `pnpm test` na raiz.
  - Confirmar que `git diff --exit-code -- index.html primeiros-passos.html plataformas.html playbook.html css js` não mostra alterações.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Hooks Git e Pipeline_CI
  - [x] 16.1 Configurar lefthook e commitlint
    - `lefthook.yml` (pre-commit: prettier, eslint, ruff nos arquivos staged, excluindo `legacyPaths`; commit-msg: commitlint com mensagem do formato `tipo(escopo): descrição`), `commitlint.config.mjs` (`scope-enum`, `scope-empty: never`), script `prepare` e dependências exatas na raiz
    - _Requirements: 15.1, 15.4, 17.3, 18.5_
    - _Depends: 3.3_
    - _Stack: repo · Est: 0.75h_
  - [x] 16.2 Implementar a validação do nome da branch
    - `src/cli/check-branch.ts` com o regex `^(feat|fix|docs|chore|refactor|test|ci|perf|build)/[a-z0-9-]+$`
    - _Requirements: 15.2_
    - _Depends: 3.2_
    - _Stack: standards · Est: 0.5h_
  - [x]* 16.3 Escrever testes de exemplo de commits e branches
    - Mensagens aceitas e rejeitadas pelo commitlint; nomes de branch válidos e inválidos
    - _Requirements: 15.1, 15.2, 15.4_
    - _Depends: 16.1, 16.2_
    - _Stack: standards · Est: 0.5h_
  - [x] 16.4 Criar `.github/workflows/ci.yml`
    - Jobs `standards` (verificador com `--changed-files`, commitlint do range, nome da branch, `security:scan` nos alterados, regeneração de contratos + `git diff --exit-code packages/contracts`), `web`, `api`, `ai` (matriz por módulo) e `coverage` (`diff-cover --fail-under=80` contra `origin/main`)
    - _Requirements: 13.3, 14.5, 17.1, 17.2_
    - _Depends: 7.9, 11.7, 14.1, 14.2, 16.1, 16.2_
    - _Stack: repo · Est: 1.5h_
  - [x] 16.5 Criar o template de pull request
    - `.github/pull_request_template.md` com resumo, link para a Spec, o que foi testado e justificativa de dependências novas
    - _Requirements: 7.7, 15.5_
    - _Depends: 3.1_
    - _Stack: repo · Est: 0.25h_

- [x] 17. Documentação
  - [x] 17.1 Escrever o `README.md` da raiz
    - Propósito do NuageHub, estrutura do Monorepo e do `.kiro/`, pré-requisitos (Node 24, pnpm, uv, Python 3.13), comandos padronizados e seção de proteção da branch `main`
    - _Requirements: 8.6, 16.1_
    - _Depends: 14.1, 16.4_
    - _Stack: repo · Est: 1h_
  - [x] 17.2 Registrar os ADRs restantes, incluindo a proteção de branch
    - `docs/adr/0001-registro-de-decisoes.md`, `0003-ferramental.md` e `0004-branch-protection.md`, este com os checks obrigatórios (`ci / standards`, `ci / web`, `ci / api`, `ci / ai`, `ci / coverage`), PR obrigatório e sem push direto, como passo manual de quem administra o GitHub
    - _Requirements: 15.3, 16.2, 17.2_
    - _Depends: 16.4_
    - _Stack: repo · Est: 0.75h_
  - [x] 17.3 Criar o backlog da migração do legado
    - `docs/legacy-migration-backlog.md` com o escopo da futura Spec `legacy-migration` e as pendências que exigiriam alterar o Site_Legado
    - _Requirements: 18.1, 18.4_
    - _Depends: 3.1_
    - _Stack: repo · Est: 0.5h_

- [ ] 18. Checkpoint final - Verificação completa
  - Rodar `pnpm standards:check`, `pnpm lint`, `pnpm typecheck` e `pnpm test` na raiz, e o `tasksGraphCheck` sobre este arquivo.
  - Confirmar que os arquivos do Site_Legado continuam inalterados (`git diff --exit-code` nos caminhos legado) e pedir ao usuário a checagem manual das quatro páginas no navegador (estilos, ícones Lucide, checklist em `nuagehub-checklist`).
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tarefas marcadas com `*` são opcionais (só testes) e podem ser puladas num MVP. As estimativas delas entram no total.
- Soma das estimativas: 75,75 h, coerente com os 76 h da Spec. Checkpoints não têm estimativa própria.
- As tarefas 1.1, 1.2 e 1.3 precisam de uma ação do usuário em sessão nova do Kiro e do Claude Code. O agente prepara os arquivos e registra o resultado.
- `pnpm-lock.yaml` é reescrito pelas tarefas que instalam dependências JS (3.2, 3.3, 10.1, 11.1, 12.1, 16.1). Por isso elas estão em ondas diferentes no grafo.
- Cada checagem do verificador fica em arquivo próprio e só é registrada no CLI em 14.2, para evitar conflitos entre tarefas paralelas. Geradores de PBT ficam em `test/arbitraries/{tema}.ts`, um arquivo por tema.
- A proteção da branch `main` (Req. 15.3, 17.2) não é aplicada por código: a tarefa 17.2 só documenta a configuração.
- Os metadados `_Requirements_`, `_Depends_` e `_Stack · Est_` deste arquivo são o formato que o `tasksGraphCheck` (6.13) deve aceitar.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "4.3", "4.4", "16.5", "17.3"] },
    { "id": 4, "tasks": ["3.3", "5.1", "6.1", "7.1", "7.3", "8.1", "16.2"] },
    { "id": 5, "tasks": ["10.1", "3.4", "6.2", "6.3", "6.11", "6.13", "6.16", "7.2", "7.4", "8.2", "8.3", "8.4", "8.6"] },
    { "id": 6, "tasks": ["11.1", "10.2", "6.4", "6.5", "6.7", "6.12", "6.14", "6.15", "6.17", "7.5", "7.6", "7.7", "7.8", "7.9", "8.7"] },
    { "id": 7, "tasks": ["12.1", "11.2", "11.3", "10.3", "13.1", "6.6", "6.8", "6.9", "6.10", "7.10", "8.5", "14.2"] },
    { "id": 8, "tasks": ["16.1", "11.4", "11.5", "12.2", "13.2", "14.1", "14.3"] },
    { "id": 9, "tasks": ["11.6", "13.3", "16.3"] },
    { "id": 10, "tasks": ["11.7"] },
    { "id": 11, "tasks": ["12.3", "16.4"] },
    { "id": 12, "tasks": ["12.4", "17.1", "17.2"] }
  ]
}
```
