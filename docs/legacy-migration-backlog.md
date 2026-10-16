# Backlog da migração do Site_Legado

Este documento registra o escopo da futura Spec `legacy-migration`. O Site_Legado é intocável durante a implementação de `project-standards`: não editar, formatar, migrar ou incluir nas verificações de stack os arquivos `index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/**` e `js/**`.

## Escopo da futura Spec

A Spec `legacy-migration` deverá substituir gradualmente as quatro páginas por rotas equivalentes no App_Web:

| Arquivo atual           | Rota equivalente planejada | Conteúdo a preservar                             |
| ----------------------- | -------------------------- | ------------------------------------------------ |
| `index.html`            | `/`                        | apresentação do onboarding e acesso ao checklist |
| `primeiros-passos.html` | `/primeiros-passos`        | primeiros passos do novo colaborador             |
| `plataformas.html`      | `/plataformas`             | plataformas e ferramentas usadas pela equipe     |
| `playbook.html`         | `/playbook`                | playbook operacional e orientações de trabalho   |

A migração deve preservar o conteúdo textual em pt-BR, a hierarquia de navegação, os estados visuais relevantes e o comportamento do checklist inicial. A chave de persistência local é `nuagehub-checklist` e deve continuar representando o estado das tarefas após a migração.

## Checklist da migração

- [ ] Criar a Spec `legacy-migration` como Spec_Simples ou promover para épico conforme a estimativa.
- [ ] Mapear cada rota e comparar o conteúdo com as quatro páginas atuais.
- [ ] Reproduzir o checklist e sua persistência usando a chave `nuagehub-checklist`.
- [ ] Substituir os ícones Lucide atualmente carregados via CDN por uma integração mantida pelo App_Web, preservando nomes e acessibilidade.
- [ ] Substituir a fonte Inter carregada via CDN por uma estratégia compatível com o App_Web e documentar o carregamento.
- [ ] Validar navegação por teclado, foco visível, rótulos acessíveis e ausência de regressões visuais.
- [ ] Fazer conferência manual das quatro rotas antes de remover qualquer dependência do legado.

## Pendências que exigem alterar o Site_Legado

- Os arquivos legados não seguem Prettier/ESLint e permanecem excluídos pelos hooks e verificadores; qualquer normalização deve ocorrer somente em `legacy-migration`.
- Há tokens duplicados entre `css/styles.css` e `apps/web/src/theme/tokens.ts`; a consolidação deve ocorrer após a decisão de migração e sem alterar o CSS legado nesta Spec.
- O script `js/main.js` controla a persistência atual do checklist; a transferência desse comportamento para React requer comparação funcional antes de tocar no arquivo original.
- Ícones Lucide e a fonte Inter são recursos CDN do legado; a troca deve ser planejada para não quebrar as páginas enquanto as rotas equivalentes não estiverem prontas.
- Qualquer mudança nos quatro HTML, em `css/**` ou em `js/**` deve ser registrada como pendência desta Spec futura e não executada como parte de `project-standards`.

## Baseline de integridade

O teste de preservação (`packages/standards/src/checks/monorepo-layout-check.test.ts`) compara o SHA-256 dos seis arquivos do Site_Legado com `packages/standards/test/fixtures/legacy-baseline.json`. O baseline reflete o estado staged anterior a esta Spec, com `css/styles.css` e `js/main.js` já movidos, e não o commit `8e043cf`, que ainda tinha `styles.css` na raiz. Ao concluir a Spec `legacy-migration`, regenere o baseline ou remova o teste.
