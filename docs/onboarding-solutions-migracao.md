# Migração para a Plataforma Onboarding Solutions (apps/web)

Estado: **em andamento**. O site legado da raiz, `apps/api` e `packages/contracts` não foram alterados.

## O que mudou em `apps/web`

- Nova estrutura em camadas: `conteudo → dominio → servicos → hooks → componentes → paginas`, em `src/`.
- Trilha de 11 Módulos com IDs estáveis. **Todo o conteúdo está como pendência explícita** até a confirmação do Gestor; a página `/pendencias` é derivada da árvore.
- Progresso em `localStorage` (`onboarding-solutions:progresso:v1`), triagem, busca, glossário, referências e chat flutuante.
- Estilos em `src/estilos/` (tokens, base, formas, componentes), alinhados ao Design System.
- Build: o plugin `scripts/plugin-corpus-chat.ts` valida o conteúdo e publica `dist/conteudo-chat.json`; `scripts/plugin-validar-ambiente.ts` exige `VITE_URL_SERVICO_CHAT` (copie `apps/web/.env.example` para `.env`).

## Código do portal SDR anterior

Os diretórios `src/api`, `src/app`, `src/components`, `src/features`, `src/theme` e `src/test-support` (52 arquivos, sem uso pela aplicação) foram **removidos**. Elas continuam no histórico do git (commit `7b2b7d0`). As 18 alterações locais não commitadas que existiam nesses arquivos estão preservadas em `docs/backup-alteracoes-locais-portal-sdr-antigo.patch`; para consultá-las, restaure os arquivos do commit e aplique o patch com `git apply`.

Os testes e2e do Playwright (`apps/web/e2e/`) continuam desativados: `pnpm --filter @nuagehub/web e2e` apenas informa a desativação, e o comando original ficou em `e2e:sdr-desativado`.

## Nova forma de testes

Os testes ficam ao lado do código (`*.test.ts[x]`) e rodam com `pnpm --filter @nuagehub/web test`: domínio e propriedades (`fast-check`, 100 execuções), serviços, estilos (paleta, contraste, raios, foco) e páginas com `axe-core`. Apoio em `src/testes-apoio/`.

## Pendências

- Confirmar o conteúdo dos Módulos, do glossário e das referências.
- Definir o destino de `apps/api`/`packages/contracts`.
- Reescrever os e2e para as novas rotas e regenerar as capturas visuais.
- Contrato de erro do Serviço de Chat: o cliente aceita `codigo` ou `code`; confirmar com o back-end.
