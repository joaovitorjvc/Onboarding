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

A configuração Playwright em `playwright.config.ts` inicia a API e o preview do App_Web. O projeto `visual` compara as páginas nas larguras 375, 768 e 1280 px com as capturas versionadas em `e2e/__screenshots__/`, geradas a partir do Site_Legado antes da sua remoção (ADR-0005). O projeto `e2e` percorre rotas, checklist, teclado e acessibilidade.

```sh
pnpm --filter @nuagehub/web e2e
```

Para aceitar uma mudança visual intencional, regenere as capturas com `pnpm --filter @nuagehub/web exec playwright test --project=visual --update-snapshots` e revise as imagens no pull request.

O Chromium é instalado pelo Playwright quando necessário (`pnpm --filter @nuagehub/web exec playwright install chromium`). O Docker não está disponível neste ambiente local (`docker info` não pôde ser executado); portanto, a baseline registrada foi gerada no macOS. O Pipeline_CI executa os testes na imagem `mcr.microsoft.com/playwright:v1.64.0-noble`.
