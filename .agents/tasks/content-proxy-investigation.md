# Investigação do proxy de conteúdo

## Resumo da resposta

A causa comprovada é operacional: o frontend tenta encaminhar as requisições `/api/v1/content/pages/*` para `http://localhost:3000`, mas não havia nenhum processo escutando na porta 3000 durante a investigação. A API também não consegue iniciar com o ambiente atual porque não existe `.env` local e faltam `NODE_ENV`, `API_PORT`, `API_CORS_ORIGIN` e `LOG_LEVEL`, variáveis exigidas pelo bootstrap antes de `app.listen()`.

O comando `pnpm build` relatado apenas compila o App_Web e o App_API; ele não inicia o servidor Vite nem a API e, portanto, não pode retornar uma URL clicável nem tornar o endpoint disponível. Os quatro slugs falham pela mesma indisponibilidade do processo/porta, não por conteúdo ou por slug inválido.

## Evidências

### 1. Destino do proxy e URL da API

- `C:\onboarding-SDR\Onboarding\apps\web\vite.config.ts`, exportação `defineConfig`, `server.proxy['/api']`: qualquer caminho iniciado por `/api` é encaminhado para `target: 'http://localhost:3000'`, com `changeOrigin: true`.
- `C:\onboarding-SDR\Onboarding\apps\web\.env.example`: define `VITE_API_BASE_URL=http://localhost:3000`.
- `C:\onboarding-SDR\Onboarding\.env.example`: repete `API_PORT=3000` e `VITE_API_BASE_URL=http://localhost:3000`.
- `C:\onboarding-SDR\Onboarding\apps\web\src\api\http-client.ts`, função `createHttpClient`: usa `VITE_API_BASE_URL` quando definido; sem essa variável, usa a origem da janela no navegador. Quando a chamada é relativa em desenvolvimento, a regra do Vite acima a encaminha para `localhost:3000`.
- `C:\onboarding-SDR\Onboarding\apps\web\src\api\content-client.ts`, função `requestPage`: chama `GET /api/v1/content/pages/{slug}`.

Assim, a porta/URL que o proxy tenta usar é **TCP 3000 em `http://localhost:3000`**.

### 2. Estado observado das portas e dos processos

Foram executadas verificações não destrutivas, sem iniciar ou reiniciar servidor:

- `Get-NetTCPConnection -State Listen -LocalPort 3000`: **NO_LISTENER**.
- `Get-NetTCPConnection -State Listen -LocalPort 5173`: **NO_LISTENER**.
- A requisição para `http://localhost:3000/api/v1/health` falhou com “Impossível conectar-se ao servidor remoto”.
- A requisição para `http://localhost:3000/api/v1/content/pages/inicio` falhou com “Impossível conectar-se ao servidor remoto”.
- A requisição para `http://localhost:5173/` também falhou porque o servidor Vite não estava escutando.
- Não havia processo `node` correspondente a um servidor ativo no momento da verificação.

Isso comprova que, no estado observado, o proxy não tem destino disponível e o Vite também não está ativo para fornecer uma URL de desenvolvimento.

### 3. A API exige configuração antes de abrir a porta

- `C:\onboarding-SDR\Onboarding\apps\api\src\main.ts`, função `bootstrap`: executa `loadEnv(process.env)` antes de criar a aplicação e somente depois chama `await app.listen(config.API_PORT)`.
- `C:\onboarding-SDR\Onboarding\apps\api\src\config\env.ts`, `environmentSchema`: exige `NODE_ENV`, `API_PORT`, `API_CORS_ORIGIN` e `LOG_LEVEL`; `CONTENT_CACHE_MAX_AGE_SECONDS` tem padrão 300.
- Não existem os arquivos `.env`, `apps/api/.env` ou `apps/web/.env` no workspace no momento da investigação.
- A validação direta da função compilada, sem iniciar servidor, foi executada com:

  `node -e "const { loadEnv } = require('./apps/api/dist/config/env.js'); try { loadEnv(process.env); console.log('CONFIG_VALID') } catch (error) { console.log(error instanceof Error ? error.message : String(error)); process.exitCode = 1 }"`

  Resultado: `Configuração inválida. Verifique: NODE_ENV, API_PORT, API_CORS_ORIGIN, LOG_LEVEL.`

Portanto, mesmo que alguém tente iniciar a API no ambiente atual, o bootstrap deve falhar antes de escutar a porta, a menos que as variáveis sejam fornecidas por ambiente externo ou por um `.env` carregado pelo fluxo de execução.

### 4. A rota existe e contempla os quatro slugs

- `C:\onboarding-SDR\Onboarding\apps\api\src\main.ts`, `bootstrap`: registra o prefixo global `api/v1`.
- `C:\onboarding-SDR\Onboarding\apps\api\src\content\content.controller.ts`, classe `ContentController`: `@Controller('content/pages')` e `@Get(':slug')` formam `GET /api/v1/content/pages/:slug`; o endpoint está marcado com `@Public()`.
- `C:\onboarding-SDR\Onboarding\apps\api\src\content\content.service.ts`, constante `PAGE_SLUGS`: define exatamente `inicio`, `primeiros-passos`, `plataformas` e `playbook`.
- `C:\onboarding-SDR\Onboarding\apps\api\src\content\content-loader.ts`, função `loadPages`: carrega e valida os JSONs de conteúdo durante a construção do serviço.
- `C:\onboarding-SDR\Onboarding\apps\api\nest-cli.json`: configura a cópia de `content/data/**/*.json` para `dist` durante o build.
- `apps/api/dist/main.js` e `apps/api/dist/content/data/inicio.json` existem, indicando que o build relatado gerou artefatos; isso não equivale à API estar escutando.
- `C:\onboarding-SDR\Onboarding\apps\api\README.md`: documenta as quatro rotas públicas e o comando `pnpm --filter @nuagehub/api dev`.

A indisponibilidade ocorre antes do roteamento HTTP. Por isso os quatro slugs têm o mesmo erro `ECONNREFUSED`; não há evidência de que qualquer um esteja sendo processado pelo controller.

### 5. O script `js/main.js` não é a origem da requisição

- `C:\onboarding-SDR\Onboarding\js\main.js` contém apenas checklist local, `localStorage` e inicialização de ícones (`lucide.createIcons()`). Não há `fetch`, cliente HTTP ou chamada para `/api` nesse arquivo.
- A chamada de conteúdo pertence ao App_Web, em `apps/web/src/api/content-client.ts`, e não aos arquivos legados nem ao `js/main.js`.

### 6. O que o `pnpm build` faz

- `C:\onboarding-SDR\Onboarding\package.json`, script `build`: delega ao CLI de padrões.
- `C:\onboarding-SDR\Onboarding\apps\web\package.json`, script `build`: executa `tsc -p tsconfig.json && vite build`, gerando arquivos estáticos.
- `C:\onboarding-SDR\Onboarding\apps\api\package.json`, script `build`: executa `nest build`, gerando `dist`.
- Os scripts de desenvolvimento são separados: `pnpm --filter @nuagehub/web dev` e `pnpm --filter @nuagehub/api dev`.

Logo, uma saída de build bem-sucedida não fornece um link clicável e não inicia os processos necessários para navegação dinâmica. Para obter uma URL, é preciso executar o servidor de desenvolvimento ou um servidor de preview/produção apropriado.

## Conclusões

1. O proxy está configurado para `http://localhost:3000`.
2. A porta 3000 não estava escutando; as chamadas locais falharam por conexão recusada.
3. A API não estava ativa. O ambiente também não contém `.env`, e a validação do bootstrap falha com quatro variáveis obrigatórias ausentes.
4. O Vite não estava ativo na porta 5173 no momento da investigação, portanto não havia URL de desenvolvimento para clicar.
5. Os quatro slugs são válidos e estão implementados no endpoint. Eles falham uniformemente porque compartilham a mesma API indisponível.
6. Nenhum arquivo de código, página legada, `js/main.js`, dependência, servidor ou configuração foi alterado nesta investigação. O relatório é o único arquivo criado por esta etapa.

## Recomendações e reprodução manual

Sem modificar código, em dois terminais PowerShell:

1. Preparar a configuração local da API, conforme documentado nos exemplos:

   `Copy-Item C:\onboarding-SDR\Onboarding\apps\api\.env.example C:\onboarding-SDR\Onboarding\apps\api\.env`

   Se o fluxo usado não carregar automaticamente `apps/api/.env`, definir as mesmas variáveis na sessão antes de iniciar a API:

   `$env:NODE_ENV='development'`

   `$env:API_PORT='3000'`

   `$env:API_CORS_ORIGIN='http://localhost:5173'`

   `$env:LOG_LEVEL='info'`

   `$env:CONTENT_CACHE_MAX_AGE_SECONDS='300'`

2. No terminal da API, a partir de `C:\onboarding-SDR\Onboarding`, executar `pnpm --filter @nuagehub/api dev`. Alternativamente, depois de um build válido, usar `pnpm --filter @nuagehub/api start` com o ambiente configurado.

3. Confirmar a API antes de abrir o frontend:

   `Invoke-WebRequest http://localhost:3000/api/v1/health`

   `Invoke-WebRequest http://localhost:3000/api/v1/content/pages/inicio`

   Repetir o segundo teste para `primeiros-passos`, `plataformas` e `playbook`; cada resposta esperada é HTTP 200 com o conteúdo da página.

4. Em outro terminal, executar `pnpm --filter @nuagehub/web dev`. O Vite normalmente exibirá uma URL local, tipicamente `http://localhost:5173/`; essa é a URL clicável. Não usar `pnpm build` como substituto do servidor de desenvolvimento.

5. Se o objetivo for somente validar o build de produção, executar `pnpm --filter @nuagehub/web preview` após o build e manter a API em execução; o terminal do preview exibirá a URL correspondente.

Se a API iniciar e ainda houver erro, o próximo diagnóstico deve ser o log do bootstrap (configuração ausente/inválida ou falha ao carregar `content/data`). Não é necessário alterar os arquivos legados para corrigir este caso; a correção é iniciar os dois servidores com a configuração exigida.

## Observação sobre o estado do repositório

A verificação `git status --short --untracked-files=all` já encontrou diversas alterações e arquivos não rastreados antes da criação deste relatório, incluindo mudanças em `apps/web`, `packages/standards`, capturas E2E e artefatos em `.agents/tasks`. Essas alterações não foram tocadas nem revertidas, em respeito ao modo somente leitura.
