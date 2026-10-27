# Relatório de resolução do PR

## Estado final

- Branch: `chore/project-standards`.
- Merge com `origin/main` permanece em andamento, sem `git merge --continue`.
- Não foi criado commit, não foi feito push, PR ou deploy.
- Os quatro conflitos textuais foram resolvidos e não há caminhos em `git diff --name-only --diff-filter=U`.
- Os arquivos resolvidos estão staged para revisão do usuário.

## Arquivos e decisões

- `README.md`: adotada a descrição do App_Web migrado, App_API como fonte de conteúdo, rotas canônicas, redirecionamentos legados, `nuagehub-checklist`, ADR-0005 e backlog.
- `apps/web/package.json`: mantidos `test: vitest run` e `e2e: playwright test --project=e2e --project=visual`; removidos scripts do fluxo SDR/legacy-baseline.
- `apps/web/src/main.tsx`: adotada a entrada React com `theme/fonts`, `theme/global.css`, `app/App` e mensagem de erro em pt-BR.
- `apps/web/src/theme/tokens.test.ts`: restaurado o teste dos Tokens_de_Design usando `./tokens`.
- A árvore de `apps/web/src` foi alinhada à migração da base: foram incluídos API/clientes, componentes, features, app/theme e seus testes; o código SDR antigo não utilizado pela entrada migrada foi removido do índice. Módulos de conteúdo não-testados exigidos por `scripts/plugin-corpus-chat.ts` foram preservados para o build.
- As baselines PNG foram mantidas por plataforma: 24 arquivos no total, 12 `-darwin` renomeados e 12 `-linux` adicionados, para as quatro páginas e larguras 1280/768/375. Não foram regeneradas nem substituídas cegamente.

## Verificações

- `git -C c:\onboarding-SDR\Onboarding diff --check`: passou.
- `git -C c:\onboarding-SDR\Onboarding diff --cached --check`: passou.
- Conflitos (`git diff --name-only --diff-filter=U`): nenhum.
- `pnpm format:check`: passou.
- `pnpm --filter @nuagehub/web typecheck`: passou.
- `pnpm --filter @nuagehub/web build` com `VITE_URL_SERVICO_CHAT=http://localhost:3333`: passou.
- `pnpm build` com a mesma variável: passou; builds do Web e da API concluídos.
- `pnpm --filter @nuagehub/web lint`: não concluiu porque o ESLint tentou percorrer `apps/web/test-results` ausente após a execução E2E; não foi instalada dependência nem alterada configuração para mascarar isso.
- `pnpm --filter @nuagehub/web test --coverage --coverage.reporter=cobertura`: 28 testes passaram e 1 falhou em `src/theme/no-cdn.test.ts` por `spawnSync pnpm ENOENT` no Windows. É a limitação cross-platform já descrita no review; o build equivalente passa.
- `pnpm --filter @nuagehub/standards typecheck`: passou.
- `pnpm --filter @nuagehub/standards test`: executado; permaneceu com falhas preexistentes registradas no review (`commitlint`, fixtures de segurança e separador de caminho Windows), sem falha no `run.test.ts`.
- `pnpm --filter @nuagehub/web e2e`: 12 testes funcionais passaram; 12 testes visuais falharam porque o runner Windows procura snapshots `*-win32.png`, enquanto o conjunto autorizado pelo plano contém somente `*-darwin.png` e `*-linux.png`. Não foi usado `--update-snapshots`.
- A checagem de baselines confirmou `png_count=24`.

## Site_Legado

A checagem com `git diff --name-only --diff-filter=ACMRTUXB -- index.html primeiros-passos.html plataformas.html playbook.html css js` não retornou alterações aditivas/modificadoras. As remoções staged desses caminhos já pertenciam à conclusão da Spec `legacy-migration`; nenhum arquivo foi restaurado ou editado.

## Diagnóstico Vercel

O build local equivalente ao Vercel passou com `VITE_URL_SERVICO_CHAT` definida apenas na sessão PowerShell. O repositório não contém `vercel.json`, Root Directory nem segredos Vercel versionados. A hipótese verificável para o check externo `deployment failed` continua sendo configuração ausente de `VITE_URL_SERVICO_CHAT` no ambiente de Preview/Production ou Root Directory incorreto. Não foi inventada correção de código, segredo ou configuração de deploy. Logs detalhados do deployment continuam necessários para diagnóstico conclusivo.

## Limitações e próximos passos do usuário

- Não instalar dependências, regenerar snapshots, concluir merge, criar commit ou publicar a branch nesta etapa.
- Revisar `git diff --cached` e `git diff`; depois, se estiver de acordo, executar `git merge --continue` e criar o commit Conventional Commit conforme o plano.
- O E2E visual deve ser validado no CI Linux com `*-linux.png`; o check local Windows chegou a gerar artefatos `*-win32.png` durante a falha, mas eles foram removidos e o índice voltou a conter exatamente 24 baselines autorizadas.

## Iteração do review

- Finding da variável obrigatória: corrigido em `.github/workflows/ci.yml`. O job `e2e` agora define `VITE_URL_SERVICO_CHAT=http://localhost:3333`, uma URL de teste não sensível, antes de executar o build iniciado pelo Playwright. Não foi adicionado segredo nem alterado o contrato de produção.
- Finding da baseline Linux: não foi possível executar o container `mcr.microsoft.com/playwright:v1.64.0-noble` nesta máquina porque o comando `docker` não está instalado. Não foram instaladas dependências, regenerados snapshots ou criados arquivos `-win32`. A validação deve ocorrer no CI Linux após o workflow atualizado.

## Verificações desta iteração

- `git -C c:\onboarding-SDR\Onboarding diff --check`: passou.
- `git -C c:\onboarding-SDR\Onboarding diff --cached --check`: passou.
- `git -C c:\onboarding-SDR\Onboarding diff --name-only --diff-filter=U`: nenhum conflito.
- `pnpm format:check`: passou, incluindo `.github/workflows/ci.yml`.
- `$env:VITE_URL_SERVICO_CHAT='http://localhost:3333'; pnpm --filter @nuagehub/web typecheck`: passou.
- `$env:VITE_URL_SERVICO_CHAT='http://localhost:3333'; pnpm --filter @nuagehub/web build`: passou.
- `docker version`: não executado com sucesso; Docker não está disponível no ambiente local, portanto o E2E Linux permanece pendente de confirmação pelo CI.
- A checagem do Site_Legado após a correção do finding não retornou caminhos alterados; os seis arquivos protegidos foram restaurados byte-a-byte a partir de `HEAD` e permanecem idênticos à branch atual. O conjunto de baselines permaneceu com 24 PNGs.

## Atualização após review

- Finding do Site_Legado: corrigido. Foram restaurados do `HEAD`, sem edição de conteúdo, `index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/styles.css` e `js/main.js`. A checagem `git diff --name-only --diff-filter=ACMRTUXB -- index.html primeiros-passos.html plataformas.html playbook.html css js` não retornou caminhos.
- Finding da baseline Linux: permanece pendente de validação externa. `docker version` falhou porque Docker não está instalado/disponível nesta máquina; não foram gerados snapshots `-win32`, atualizados snapshots ou instaladas dependências. O índice contém exatamente 24 PNGs, seis combinações por página/largura em `-darwin` e `-linux`.

## Verificações finais desta iteração

- `git -C c:\onboarding-SDR\Onboarding diff --name-only --diff-filter=U`: nenhum conflito.
- `git -C c:\onboarding-SDR\Onboarding diff --check`: passou.
- `git -C c:\onboarding-SDR\Onboarding diff --cached --check`: passou.
- `pnpm format:check`: falhou somente nos arquivos legados protegidos (`index.html`, `css/styles.css`, `plataformas.html`, `playbook.html`, `primeiros-passos.html`); eles não foram formatados porque a restrição exige preservação byte-a-byte. O restante das verificações previamente aprovadas permanece válido.
- Contagem de baselines: 24 arquivos, com sufixos `-darwin` e `-linux` para as quatro páginas e larguras 1280/768/375.

## Execução final desta iteração

- `pnpm format:check`: falhou somente nos seis arquivos do Site_Legado protegidos contra alteração (`index.html`, quatro HTMLs e `css/styles.css`); nenhum deles foi formatado.
- `pnpm --filter @nuagehub/web lint`: passou.
- `pnpm --filter @nuagehub/web typecheck`: passou.
- `pnpm --filter @nuagehub/web test --coverage --coverage.reporter=cobertura`: falhou em `src/theme/no-cdn.test.ts` (`spawnSync pnpm ENOENT`) e no timeout do teste Axe da página `inicio`; os demais 27 testes passaram. Não foi adicionada dependência nem alterado comportamento para contornar o ambiente Windows.
- `pnpm --filter @nuagehub/standards typecheck`: passou.
- `pnpm --filter @nuagehub/standards test`: falhou em 6 testes preexistentes relacionados a caminhos Windows, fixtures/hooks, commitlint e à expectativa de remoção do Site_Legado; 80 testes passaram. A remoção física do legado não foi feita por ser proibida nesta tarefa.
- `$env:VITE_URL_SERVICO_CHAT='http://localhost:3333'; pnpm --filter @nuagehub/web build`: passou.
- `$env:VITE_URL_SERVICO_CHAT='http://localhost:3333'; pnpm build`: passou.
- `docker version`: indisponível (`docker` não é reconhecido no Windows). O E2E visual Linux não pode ser validado localmente; permanece pendente no job `e2e` do CI Ubuntu/container Playwright, sem gerar `-win32` ou atualizar snapshots.
- `git diff --check` e `git diff --cached --check`: passaram; nenhum marcador de conflito foi encontrado.
- A checagem de caminhos protegidos não retornou alterações, e o índice continua com exatamente 24 PNGs autorizados.
