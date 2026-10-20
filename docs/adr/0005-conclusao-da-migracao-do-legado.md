# ADR-0005: Conclusão da migração do Site_Legado

Última alteração: 2026-10-20 · Status: Aceito

## Contexto

O NuageHub era servido por quatro páginas HTML estáticas na raiz (`index.html`, `primeiros-passos.html`, `plataformas.html` e `playbook.html`), com `css/styles.css` e `js/main.js`. A Spec `project-standards` congelou esses arquivos como Site_Legado, e a Constituição os declarava intocáveis até a Spec `legacy-migration`.

A Spec `legacy-migration` entregou o Contrato_de_Conteudo em `packages/contracts`, o conteúdo das quatro páginas servido pelo App_API (`/api/v1/content/{slug}`) e as Paginas_Migradas no App_Web, com redirecionamento das URLs antigas e o checklist preservado na chave `nuagehub-checklist`. A equivalência foi comprovada por teste de paridade textual, testes de ponta a ponta, axe-core e comparação visual nas larguras 375, 768 e 1280 px.

## Decisão

- Remover o Site_Legado do repositório e manter o App_Web como única implementação do portal.
- Retirar da Constituição as regras "Trate o Site_Legado como conteúdo intocável…" e "Preserve os caminhos do Site_Legado…", e atualizar steering, `README.md` e `docs/legacy-migration-backlog.md`.
- Manter o mecanismo `legacyPaths` do Verificador_de_Padroes com lista vazia em `standards.config.json`; o `legacyListsCheck` aceita comandos do lefthook sem `exclude` quando a lista canônica está vazia.
- Trocar o teste de integridade por hash (`legacy-baseline.json`) por um teste que confirma a ausência dos arquivos legados na raiz.
- Fazer de `apps/web/src/theme/tokens.ts` a fonte única dos Tokens_de_Design, com os valores fixados em teste.
- Manter como referência visual as capturas versionadas em `apps/web/e2e/__screenshots__/`, geradas a partir do Site_Legado antes da remoção. O Docker não estava disponível localmente, então as capturas foram geradas no macOS; o Pipeline_CI roda na imagem `mcr.microsoft.com/playwright:v1.64.0-noble` e, se a renderização de fonte do Linux divergir acima da tolerância, as capturas devem ser regeneradas nessa imagem e revisadas no pull request.

## Consequências

- O portal só existe em `apps/web` + `apps/api`; não há mais arquivos excluídos de Prettier, ESLint e lefthook.
- O teste de paridade textual (`legacy-parity.test.ts`), o projeto Playwright `legacy-baseline` e o servidor estático `serve-legacy.mjs` deixam de existir. Mudanças de conteúdo passam a ser feitas nos JSON de `apps/api/src/content/data/`.
- As URLs antigas continuam funcionando por redirecionamento no App_Web.
- Recuperar o Site_Legado exige o histórico do Git (último commit com os arquivos: o pai do commit de remoção).
