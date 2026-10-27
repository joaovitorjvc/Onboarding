# NuageHub

O NuageHub é o portal de onboarding da NuageIT. Este repositório é um Monorepo que reúne o frontend React (Plataforma Onboarding Solutions), a API NestJS, módulos Python de IA e pacotes compartilhados. O Site_Legado continua na raiz, intocado, enquanto a migração não é concluída.

## Estrutura do Monorepo

- `apps/web`: App_Web em React, Vite, TypeScript e Vitest. Contém a Plataforma Onboarding Solutions (Trilha de 11 Módulos, progresso, triagem, busca, glossário, referências, pendências e chat). Veja `docs/onboarding-solutions-migracao.md`.
- `apps/api`: App_API em NestJS, com endpoint público de saúde e contratos OpenAPI. O site novo **não** consome mais esta API.
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

## Rodar o site localmente

O site (App_Web) lê todo o conteúdo localmente e **não precisa da API** para funcionar.

1. Instale as dependências (seção anterior).
2. Crie o arquivo de ambiente do web:

   ```sh
   cp apps/web/.env.example apps/web/.env
   ```

   No PowerShell: `Copy-Item apps/web/.env.example apps/web/.env`.

3. Inicie o site:

   ```sh
   pnpm --filter @nuagehub/web dev
   ```

4. Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`).

Variáveis de `apps/web/.env`:

- `VITE_URL_SERVICO_CHAT`: URL do Serviço de Chat (padrão `http://localhost:3333`). É **opcional no `dev`**: sem ela o site abre e o chat informa que não está configurado. É **obrigatória no build**, que falha se ela estiver ausente ou não for uma URL `http`/`https`.
- `VITE_API_BASE_URL`: usada apenas pelo código do portal SDR anterior, hoje sem uso na aplicação.

O Serviço de Chat é um back-end separado (repositório `onboarding-solutions-back`), que não faz parte deste Monorepo. Para testar o chat, suba esse serviço na URL configurada; o `apps/api` deste repositório não responde `/api/chat`.

Para gerar o build estático e conferi-lo:

```sh
# defina VITE_URL_SERVICO_CHAT no apps/web/.env (ou no ambiente) antes do build
pnpm --filter @nuagehub/web build
pnpm --filter @nuagehub/web preview
```

O build publica `dist/conteudo-chat.json`, o corpus usado pelo chat.

### Rodar a API (opcional)

A API não é necessária para o site novo. Para executá-la:

```sh
cp apps/api/.env.example apps/api/.env   # defina NODE_ENV, API_PORT, API_CORS_ORIGIN e LOG_LEVEL
pnpm --filter @nuagehub/api dev
```

Ela responde em `http://localhost:3000` (`GET /api/v1/health`). `pnpm dev` na raiz inicia todas as stacks em paralelo; para trabalhar só no site, prefira o comando `--filter @nuagehub/web` acima.

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

## Site_Legado intocável

As páginas atuais permanecem na raiz. Elas **não** são o site executado por `pnpm --filter @nuagehub/web dev` (veja "Rodar o site localmente"); para abrir a versão legada, abra `index.html` diretamente no navegador. As demais páginas são `primeiros-passos.html`, `plataformas.html` e `playbook.html`. Não altere, formate ou migre os HTML, `css/**` ou `js/**` fora da Spec `legacy-migration`. Consulte `docs/legacy-migration-backlog.md` para o escopo futuro.

## Proteção da branch `main`

A branch `main` deve aceitar mudanças somente por pull request aprovado pelo Pipeline_CI. Os checks obrigatórios são `ci / standards`, `ci / web`, `ci / api`, `ci / ai` e `ci / coverage`, sem push direto. A configuração é uma ação manual da administração do GitHub; o comando equivalente está documentado no [ADR-0004](docs/adr/0004-branch-protection.md).
