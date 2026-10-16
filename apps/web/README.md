# App_Web

Frontend React do NuageHub, responsável pela experiência de onboarding em pt-BR.

## Comandos

Execute a partir da raiz do monorepo:

- `pnpm --filter @nuagehub/web dev`: inicia o servidor de desenvolvimento.
- `pnpm --filter @nuagehub/web build`: executa o typecheck e gera o build de produção.
- `pnpm --filter @nuagehub/web test`: executa os testes Vitest uma única vez.
- `pnpm --filter @nuagehub/web lint`: executa o ESLint.
- `pnpm --filter @nuagehub/web typecheck`: verifica os tipos TypeScript sem emitir arquivos.

## Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `VITE_API_BASE_URL`: URL base do App_API usada pelo cliente HTTP tipado.

O conteúdo de apresentação não faz chamadas de rede diretamente; integrações usam `src/api/http-client.ts`.

## Testes visuais e E2E

A configuração Playwright em `playwright.config.ts` inicia a API, o preview do App_Web e, no projeto `legacy-baseline`, o servidor estático do Site_Legado. Para gerar as capturas nas larguras 375, 768 e 1280 px:

```sh
pnpm --filter @nuagehub/web e2e:baseline
pnpm --filter @nuagehub/web e2e
```

O Chromium é instalado pelo Playwright quando necessário. O Docker não está disponível neste ambiente local (`docker info` não pôde ser executado); portanto, a baseline registrada foi gerada no macOS. O Pipeline_CI executa os testes na imagem `mcr.microsoft.com/playwright:v1.64.0-noble`.
