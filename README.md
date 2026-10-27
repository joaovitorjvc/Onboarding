# NuageHub

O NuageHub é o portal de onboarding da NuageIT, com foco inicial em novos SDRs. Este repositório é um Monorepo que reúne o frontend React, a API NestJS, módulos Python de IA e pacotes compartilhados. O portal é servido pelo App_Web, que lê o conteúdo das páginas do App_API.

## Estrutura do Monorepo

- `apps/web`: App_Web em React, Vite, TypeScript e Vitest, com as páginas do portal.
- `apps/api`: App_API em NestJS, com endpoints públicos de saúde e de conteúdo das páginas e contratos OpenAPI.
- `services/ai/{nome-do-modulo}`: Modulos_IA em Python, gerenciados individualmente por uv.
- `packages/contracts`: Formato_de_Erro e tipos gerados a partir do OpenAPI.
- `packages/standards`: Verificador_de_Padroes, CLIs e utilitários dos hooks.
- `packages/config`: configurações compartilhadas de TypeScript.
- `docs/adr`: decisões arquiteturais numeradas.
- `.github`: Pipeline_CI e template de pull request.

### Governança em `.kiro/`

- `.kiro/constitution.md`: Fonte_Canonica_de_Padroes e regras inegociáveis.
- `.kiro/agents/nuagehub.json`: agente de projeto do Kiro CLI, com hooks de segurança, validação e steering condicional.
- `.kiro/settings/cli.json`: define `nuagehub` como agente padrão do workspace.
- `.kiro/specs/`: requisitos, design e tarefas das Specs.
- `.kiro/steering/always/`: regras sempre ativas.
- `.kiro/steering/auto/`: regras carregadas automaticamente ou lidas sob demanda.
- `.kiro/steering/conditional/`: regras específicas de React, NestJS e Python.
- `.kiro/steering/manual/`: guias consultados explicitamente.

`CLAUDE.md` e `.claude/rules/` são arquivos de navegação para entregar as mesmas regras ao Claude Code. Os scripts comuns ficam em `scripts/hooks/`.

## Pré-requisitos

- Node.js 24, conforme `.nvmrc`.
- pnpm 10.34.6, habilitado com Corepack (`corepack enable`) ou instalado via npm.
- uv, para os módulos Python.
- Python 3.13, conforme `.python-version`.

## Instalação

```sh
corepack enable
corepack prepare pnpm@10.34.6 --activate
pnpm install --frozen-lockfile
uv sync --locked --directory services/ai/example
```

As dependências já estão declaradas com versões exatas nos manifestos e lockfiles. Variáveis necessárias ficam documentadas nos arquivos `.env.example`; não coloque segredos no repositório.

## Comandos padronizados

Na raiz, os comandos aceitam `--affected` para executar somente as stacks afetadas:

```sh
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm lint --affected
pnpm typecheck --affected
pnpm test --affected
pnpm standards:check
pnpm security:scan caminho/para/arquivo.ts
pnpm format
pnpm format:check
```

Comandos específicos úteis:

```sh
pnpm --filter @nuagehub/standards test
pnpm --filter @nuagehub/api test
pnpm --filter @nuagehub/web test
uv run --directory services/ai/example pytest
```

O `lefthook` executa Prettier, ESLint e Ruff nos arquivos staged. O hook de commit valida Conventional Commits no formato `tipo(escopo): descrição`, com escopo obrigatório.

## Uso com agentes de código

No Kiro CLI, selecione o agente de projeto `nuagehub`, definido em `.kiro/agents/nuagehub.json`, para receber os hooks e o steering condicional. Antes de implementar, consulte a Spec correspondente em `.kiro/specs/` e siga a ordem requisitos → design → tarefas → implementação.

No Claude Code, mantenha `CLAUDE.md` como contexto inicial e use as regras escopadas em `.claude/rules/`. A Constituição prevalece em caso de conflito.

## Executar o portal

```sh
pnpm dev
```

O comando inicia o App_API e o App_Web. As rotas são `/`, `/primeiros-passos`, `/plataformas` e `/playbook`; as URLs antigas (`/index.html`, `/primeiros-passos.html`, `/plataformas.html` e `/playbook.html`) redirecionam para elas. O checklist continua salvo no navegador com a chave `nuagehub-checklist`. As variáveis de cada aplicação estão nos arquivos `.env.example` e nos READMEs de `apps/web` e `apps/api`.

O site estático original foi removido ao fim da Spec `legacy-migration`; veja o [ADR-0005](docs/adr/0005-conclusao-da-migracao-do-legado.md) e o histórico em `docs/legacy-migration-backlog.md`.

## Proteção da branch `main`

A branch `main` deve aceitar mudanças somente por pull request aprovado pelo Pipeline_CI. Os checks obrigatórios são `ci / standards`, `ci / web`, `ci / api`, `ci / ai` e `ci / coverage`, sem push direto. A configuração é uma ação manual da administração do GitHub; o comando equivalente está documentado no [ADR-0004](docs/adr/0004-branch-protection.md).
