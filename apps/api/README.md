# App_API

Backend NestJS do NuageHub. O bootstrap valida as variáveis de ambiente e o conteúdo das páginas antes de abrir a porta, aplica o prefixo `/api/v1`, autenticação global por padrão e documentação Swagger em `/api/docs`.

## Comandos

A partir da raiz do monorepo:

```bash
pnpm --filter @nuagehub/api dev
pnpm --filter @nuagehub/api build
pnpm --filter @nuagehub/api lint
pnpm --filter @nuagehub/api typecheck
pnpm --filter @nuagehub/api test
pnpm --filter @nuagehub/api openapi:export
```

Os testes Jest executam em modo único. As rotas públicas são `GET /api/v1/health`, `GET /api/v1/content/pages` e `GET /api/v1/content/pages/:slug`. As demais rotas exigem autenticação, salvo uso explícito de `@Public()`.

## Conteúdo

As quatro páginas ficam em `src/content/data/` e são validadas contra o schema canônico de `packages/contracts` durante a inicialização. Um arquivo inválido encerra o processo com o caminho e o campo que falhou. O build copia os JSONs para `dist/content/data/`.

- `GET /api/v1/content/pages`: lista `slug`, `navLabel` e `documentTitle` na ordem `inicio`, `primeiros-passos`, `plataformas`, `playbook`.
- `GET /api/v1/content/pages/:slug`: retorna o `PageContent` completo; slug desconhecido retorna o `Formato_de_Erro` com `NOT_FOUND`.

As respostas de conteúdo incluem `Cache-Control: public, max-age=...`.

## Variáveis de ambiente

- `NODE_ENV`: `development`, `test` ou `production`.
- `API_PORT`: porta TCP inteira entre 1 e 65535.
- `API_CORS_ORIGIN`: origem válida para CORS, como `http://localhost:5173`.
- `LOG_LEVEL`: nível Pino entre `fatal`, `error`, `warn`, `info`, `debug`, `trace` e `silent`.
- `CONTENT_CACHE_MAX_AGE_SECONDS`: inteiro entre 0 e 86400; padrão `300`.

Copie `.env.example` para `.env` durante o desenvolvimento e nunca versione valores secretos.
