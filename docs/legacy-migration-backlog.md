# Backlog da migração do Site_Legado

Status: concluído em 2026-10-20 · Arquivado. Decisão registrada no [ADR-0005](adr/0005-conclusao-da-migracao-do-legado.md).

Este documento registrava o escopo da Spec `legacy-migration`. O Site_Legado (`index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/**` e `js/**`) foi migrado para o App_Web e removido do repositório. Os detalhes estão em `.kiro/specs/legacy-migration/`.

## Escopo entregue

| Arquivo removido        | Rota no App_Web     | Conteúdo preservado                              |
| ----------------------- | ------------------- | ------------------------------------------------ |
| `index.html`            | `/`                 | apresentação do onboarding e acesso ao checklist |
| `primeiros-passos.html` | `/primeiros-passos` | primeiros passos do novo colaborador             |
| `plataformas.html`      | `/plataformas`      | plataformas e ferramentas usadas pela equipe     |
| `playbook.html`         | `/playbook`         | playbook operacional e orientações de trabalho   |

As URLs antigas redirecionam para as rotas novas. O checklist continua salvo no navegador com a chave `nuagehub-checklist`.

## Checklist da migração

- [x] Criar a Spec `legacy-migration` como Spec_Simples ou promover para épico conforme a estimativa.
- [x] Mapear cada rota e comparar o conteúdo com as quatro páginas atuais.
- [x] Reproduzir o checklist e sua persistência usando a chave `nuagehub-checklist`.
- [x] Substituir os ícones Lucide atualmente carregados via CDN por uma integração mantida pelo App_Web, preservando nomes e acessibilidade.
- [x] Substituir a fonte Inter carregada via CDN por uma estratégia compatível com o App_Web e documentar o carregamento.
- [x] Validar navegação por teclado, foco visível, rótulos acessíveis e ausência de regressões visuais.
- [x] Fazer conferência manual das quatro rotas antes de remover qualquer dependência do legado. A conferência manual foi substituída pela aprovação explícita da remoção pelo usuário em 2026-10-20, apoiada nos testes visuais e de ponta a ponta verdes.

## Pendências resolvidas

- Os arquivos legados saíram do repositório; Prettier, ESLint e lefthook não têm mais exclusões de Site_Legado.
- Os Tokens_de_Design ficam só em `apps/web/src/theme/tokens.ts`.
- A persistência do checklist foi transferida para `apps/web/src/features/checklist/`.
- Ícones e fonte Inter são empacotados pelo App_Web, sem CDN.
- O teste de integridade por hash (`legacy-baseline.json`) foi substituído por um teste de ausência dos arquivos legados na raiz.
