# Requirements Document

**Estimativa_de_Esforco:** 44h (Spec_Simples)

## Introduction

O NuageHub ainda é servido pelo Site_Legado: quatro páginas HTML estáticas na raiz (`index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`), a folha `css/styles.css`, o script `js/main.js` (checklist persistido no `localStorage` com a chave `nuagehub-checklist`), ícones Lucide 0.469.0 e a fonte Inter carregados por CDN. A Spec `project-standards` criou o App_Web (React), o App_API (NestJS) e os Modulos_IA (Python) só como esqueletos e congelou o Site_Legado até esta Spec (Req. 18 daquela Spec).

Esta Spec migra o Site_Legado por completo para o Monorepo:

- O App_Web passa a renderizar as quatro páginas como rotas React, com a mesma aparência e o mesmo conteúdo.
- O conteúdo das páginas passa a ser servido pelo App_API, em endpoints públicos de leitura, tipados pelos contratos de `packages/contracts`.
- O checklist inicial mantém a persistência no navegador e preserva o progresso já salvo pelos colaboradores.
- Ícones e fonte deixam de depender de CDN.
- Ao final, os arquivos do Site_Legado e todas as exclusões criadas para protegê-los são removidos.

Escopo:

- Dentro do escopo: rotas e componentes do App_Web, módulo de conteúdo do App_API, contratos de conteúdo, checklist, ícones e fonte locais, paridade visual, acessibilidade, redirecionamento das URLs antigas, remoção do Site_Legado, atualização da Constituicao, do steering, do `CLAUDE.md`, do Verificador_de_Padroes, das configurações de lint/format/hooks e da documentação.
- Fora do escopo: edição de conteúdo por interface administrativa, autenticação de colaboradores, persistência do checklist no servidor, hospedagem e deploy em produção, e funcionalidades de IA. O Site_Legado não usa IA, então nenhum Modulo_IA é criado ou alterado nesta Spec.

Os critérios de aceitação seguem EARS com as palavras-chave traduzidas: QUANDO (WHEN), ENQUANTO (WHILE), SE ... ENTÃO (IF ... THEN), ONDE (WHERE), PARA TODO (FOR ALL) e DEVE (SHALL).

## Glossary

Os termos de [project-standards](../project-standards/requirements.md#glossary) valem aqui (Repositório, App_Web, App_API, Site_Legado, Constituicao, Tokens_de_Design, Formato_de_Erro, Verificador_de_Padroes, Pipeline_CI, Agente_IA). Termos novos:

- **Pagina_Migrada**: cada uma das quatro páginas do App_Web que substituem as páginas do Site_Legado: Início, Primeiros Passos, Plataformas e Playbook.
- **Rota_Canonica**: o caminho de uma Pagina_Migrada no App_Web: `/`, `/primeiros-passos`, `/plataformas` e `/playbook`.
- **URL_Legada**: o caminho de uma página do Site_Legado: `/index.html`, `/primeiros-passos.html`, `/plataformas.html` e `/playbook.html`.
- **Conteudo_de_Pagina**: os dados estruturados de uma Pagina_Migrada (títulos, parágrafos, listas, passos, cartões, links e nomes de ícones), identificados por um `slug`.
- **Contrato_de_Conteudo**: o esquema de Conteudo_de_Pagina definido em `packages/contracts` e exposto no OpenAPI do App_API.
- **Checklist_Inicial**: a lista de itens marcáveis da página Início (`setup`, `plataformas`, `playbook`) e seu estado.
- **Chave_do_Checklist**: a chave `nuagehub-checklist` do `localStorage`, que guarda um objeto JSON `{ [id]: boolean }`.
- **Layout_Comum**: cabeçalho com logotipo, navegação principal, selo "Novo SDR" e rodapé, compartilhados pelas Paginas_Migradas.
- **Paridade_Visual**: a equivalência entre a Pagina_Migrada e a página correspondente do Site_Legado em estrutura, textos, cores, tipografia, espaçamentos, ícones e comportamento responsivo nos pontos de quebra de 640 px e 768 px.
- **Baseline_Visual**: as capturas de tela das quatro páginas do Site_Legado, geradas antes da remoção dos arquivos e versionadas para comparação.

## Requirements

### Requirement 1: Rotas do App_Web

**User Story:** Como novo SDR, quero acessar as mesmas quatro páginas de hoje no novo portal, para que eu siga meu onboarding sem perceber a troca de tecnologia.

#### Acceptance Criteria

1. O App_Web DEVE expor uma Pagina_Migrada em cada Rota_Canonica: Início em `/`, Primeiros Passos em `/primeiros-passos`, Plataformas em `/plataformas` e Playbook em `/playbook`.
2. QUANDO o usuário acessar uma URL_Legada, o App_Web DEVE redirecioná-lo para a Rota_Canonica correspondente, substituindo a entrada no histórico do navegador.
3. SE o usuário acessar um caminho que não seja Rota_Canonica nem URL_Legada, ENTÃO o App_Web DEVE exibir uma página "Página não encontrada" em pt-BR com link para a página Início.
4. QUANDO uma Pagina_Migrada for exibida, o App_Web DEVE definir o título do documento igual ao título da página correspondente do Site_Legado (por exemplo, `Primeiros Passos - NuageHub`).
5. QUANDO o usuário navegar entre Paginas_Migradas pela navegação principal, o App_Web DEVE trocar de página sem recarregar o documento e mover o foco para o título principal da nova página.
6. O App_Web DEVE funcionar como build estático gerado por `pnpm --filter @nuagehub/web build`, servível por qualquer servidor de arquivos com fallback para `index.html`.

### Requirement 2: Layout comum

**User Story:** Como colaborador, quero o mesmo cabeçalho, navegação e rodapé em todas as páginas, para que eu me localize no portal.

#### Acceptance Criteria

1. O App_Web DEVE renderizar o Layout_Comum em todas as Paginas_Migradas, com o logotipo "NuageHub" ligado à página Início, os quatro itens de navegação (Página Inicial, Primeiros passos, Plataformas, Playbook), o selo "Novo SDR" e o rodapé `© 2026 NuageIT • Portal de Integração & Rampa de Novos Colaboradores`.
2. ENQUANTO uma Pagina_Migrada estiver ativa, o item de navegação correspondente DEVE ter `aria-current="page"` e o estilo de item ativo do Site_Legado.
3. O Layout_Comum DEVE manter os rótulos acessíveis do Site_Legado, incluindo `aria-label="Navegação principal"` na navegação e `aria-label="NuageHub - Página Inicial"` no logotipo.

### Requirement 3: Conteúdo servido pelo App_API

**User Story:** Como mantenedor do portal, quero que o conteúdo das páginas venha da API, para que ele possa ser atualizado sem alterar componentes do frontend.

#### Acceptance Criteria

1. O App_API DEVE expor `GET /api/v1/content/pages` (lista de `slug` e título) e `GET /api/v1/content/pages/{slug}` (Conteudo_de_Pagina), marcados como públicos nesta Spec.
2. O App_API DEVE manter o Conteudo_de_Pagina das quatro páginas em arquivos de dados versionados no módulo de conteúdo, validados contra o Contrato_de_Conteudo na inicialização.
3. SE um arquivo de Conteudo_de_Pagina violar o Contrato_de_Conteudo, ENTÃO o App_API DEVE encerrar a inicialização com mensagem que identifique o arquivo e o campo inválido.
4. SE o `slug` solicitado não existir, ENTÃO o App_API DEVE responder com status 404 e corpo no Formato_de_Erro com código `NOT_FOUND`.
5. O Conteudo_de_Pagina DEVE reproduzir integralmente os textos, listas, passos, links externos e nomes de ícones das páginas do Site_Legado, sem perda de informação.
6. O Repositório DEVE definir o Contrato_de_Conteudo em `packages/contracts` e gerar dele os tipos usados pelo App_Web e pelo App_API, conforme o Req. 13 de project-standards.
7. PARA TODO Conteudo_de_Pagina válido, serializar em JSON e desserializar DEVE produzir um objeto equivalente ao original (round-trip).
8. O App_API DEVE responder ao conteúdo com cabeçalho de cache (`Cache-Control` com `max-age` configurável por variável de ambiente validada).

### Requirement 4: Consumo de conteúdo no App_Web

**User Story:** Como novo SDR, quero que a página carregue de forma clara mesmo quando a API demora ou falha, para que eu entenda o que está acontecendo.

#### Acceptance Criteria

1. O App_Web DEVE buscar o Conteudo_de_Pagina somente pela camada de cliente HTTP (`src/api/`), conforme o Req. 9.7 de project-standards.
2. ENQUANTO o Conteudo_de_Pagina estiver carregando, o App_Web DEVE exibir um indicador de carregamento acessível (`aria-busy` e texto para leitores de tela) dentro do Layout_Comum.
3. SE a busca do Conteudo_de_Pagina falhar, ENTÃO o App_Web DEVE exibir mensagem de erro em pt-BR com o `correlationId` do Formato_de_Erro e um botão "Tentar novamente".
4. QUANDO o usuário voltar a uma Pagina_Migrada já carregada na mesma sessão, o App_Web DEVE exibi-la a partir do cache em memória, sem nova requisição.
5. O App_Web DEVE renderizar o Conteudo_de_Pagina como texto, sem interpretar HTML vindo da API.
6. QUANDO um link externo do Conteudo_de_Pagina for renderizado, o App_Web DEVE abri-lo em nova aba com `rel="noopener noreferrer"` e indicar isso ao leitor de tela.

### Requirement 5: Checklist inicial

**User Story:** Como novo SDR, quero marcar meu progresso da primeira semana e encontrá-lo marcado quando voltar, inclusive o que marquei no site antigo.

#### Acceptance Criteria

1. A página Início DEVE exibir o Checklist_Inicial com os itens `setup` (Dia 1), `plataformas` (Dia 2-3) e `playbook` (Semana 1), com os textos do Site_Legado.
2. QUANDO o usuário ativar um item por clique, Enter ou Espaço, o App_Web DEVE alternar o estado do item e gravá-lo na Chave_do_Checklist.
3. QUANDO a página Início for carregada, o App_Web DEVE restaurar o estado de cada item a partir da Chave_do_Checklist, no mesmo formato usado pelo `js/main.js` do Site_Legado.
4. ONDE a Chave_do_Checklist não tiver valor para um item, o App_Web DEVE usar o estado inicial do Site_Legado (`setup` marcado; `plataformas` e `playbook` desmarcados).
5. SE o `localStorage` estiver indisponível ou a Chave_do_Checklist contiver JSON inválido, ENTÃO o App_Web DEVE exibir o checklist com o estado inicial e continuar funcionando sem persistir.
6. Cada item do Checklist_Inicial DEVE ser exposto como `role="checkbox"` com `aria-checked` refletindo o estado, focável por teclado.
7. PARA TODA sequência de ativações de itens, o estado gravado na Chave_do_Checklist DEVE ser igual ao estado exibido, e recarregar a página DEVE reproduzir o mesmo estado.

### Requirement 6: Ícones e fonte sem CDN

**User Story:** Como tech lead, quero que o portal não dependa de CDNs de terceiros, para reduzir pontos de falha e riscos de cadeia de suprimentos.

#### Acceptance Criteria

1. O App_Web DEVE renderizar os ícones com um pacote de ícones Lucide para React com versão exata, cobrindo todos os ícones usados no Site_Legado (`arrow-right`, `award`, `book-open`, `chevron-right`, `circle-check`, `clock`, `compass`, `external-link`, `house`, `layers`, `receipt`, `sparkles`).
2. O App_Web DEVE carregar a fonte Inter (pesos 400, 500, 600, 700 e 800) a partir de pacote local com versão exata, empacotado no build.
3. O build do App_Web NÃO DEVE referenciar `fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com` nem outra origem externa para scripts, folhas de estilo ou fontes.
4. SE o Conteudo_de_Pagina referenciar um nome de ícone não suportado, ENTÃO o App_Web DEVE omitir o ícone sem quebrar a página, e o teste de contrato DEVE falhar para esse nome.
5. Ícones decorativos DEVEM ter `aria-hidden="true"`.

### Requirement 7: Paridade visual e responsividade

**User Story:** Como product owner, quero que o portal novo tenha a mesma cara do atual, para que a migração não exija reaprendizado.

#### Acceptance Criteria

1. O App_Web DEVE aplicar os Tokens_de_Design de `src/theme/tokens.ts` como única fonte de cores, tipografia, raios e sombras, sem valores visuais duplicados nos componentes.
2. O App_Web DEVE reproduzir os estilos do Site_Legado por componente (CSS Modules ou equivalente com escopo por componente), mantendo os pontos de quebra de 640 px e 768 px.
3. Antes da remoção do Site_Legado, o Repositório DEVE gerar e versionar a Baseline_Visual das quatro páginas nas larguras 375 px, 768 px e 1280 px.
4. QUANDO os testes visuais forem executados, cada Pagina_Migrada DEVE diferir da Baseline_Visual em no máximo 2% dos pixels em cada largura.
5. O App_Web DEVE preservar os estados de foco visível, hover e item de checklist concluído do Site_Legado.

### Requirement 8: Acessibilidade

**User Story:** Como colaborador que usa teclado ou leitor de tela, quero navegar pelo portal sem barreiras.

#### Acceptance Criteria

1. Cada Pagina_Migrada DEVE passar na verificação automática de acessibilidade (axe-core) sem violações, incluindo contraste de cor.
2. Cada Pagina_Migrada DEVE ter exatamente um `h1` e hierarquia de títulos sem saltos.
3. O Layout_Comum DEVE oferecer um link "Pular para o conteúdo" como primeiro elemento focável.
4. O App_Web DEVE declarar `lang="pt-BR"` no documento.

### Requirement 9: Remoção do Site_Legado

**User Story:** Como tech lead, quero remover o site antigo ao concluir a migração, para que só exista uma implementação do portal.

#### Acceptance Criteria

1. QUANDO os Requirements 1 a 8 estiverem atendidos e o usuário aprovar a checagem manual das Paginas_Migradas, o Repositório DEVE remover `index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/` e `js/` da raiz.
2. A remoção DEVE apagar os `legacyPaths` de `standards.config.json` e as exclusões correspondentes de `.prettierignore`, `eslint.config.mjs` e `lefthook.yml`, mantendo a checagem de listas consistente.
3. A remoção DEVE substituir o teste de integridade do Site_Legado (`legacy-baseline.json`) por um teste que confirme a ausência dos arquivos legados na raiz.
4. A remoção DEVE atualizar a Constituicao, o steering, o `CLAUDE.md`, o `README.md` e o `docs/legacy-migration-backlog.md` para não citar mais o Site_Legado como ativo.
5. Como a Constituicao será alterada, o pull request DEVE incluir um ADR em `docs/adr/` registrando a conclusão da migração, conforme o Req. 1.6 de project-standards.
6. A cópia do Tokens_de_Design de `css/styles.css` DEVE deixar de ser verificada contra o CSS legado; `src/theme/tokens.ts` passa a ser a fonte única.

### Requirement 10: Testes e qualidade

**User Story:** Como tech lead, quero que a migração chegue verificada, para que regressões apareçam no CI.

#### Acceptance Criteria

1. Os testes DEVEM cobrir cada critério de aceitação testável desta Spec com Vitest no App_Web e Jest no App_API, conforme o Req. 14 de project-standards.
2. O Repositório DEVE ter um teste que compare o texto de cada Conteudo_de_Pagina com o texto visível da página correspondente do Site_Legado, executado antes da remoção, e falhe se algum trecho estiver ausente.
3. O Repositório DEVE ter um teste de ponta a ponta em navegador real que percorra as quatro Rotas_Canonicas, as quatro URLs_Legadas e o Checklist_Inicial com o App_Web e o App_API em execução.
4. O Pipeline_CI DEVE executar os testes visuais e de ponta a ponta em pull requests que alterem `apps/web`, `apps/api` ou `packages/contracts`.
5. O `pnpm standards:check`, o `lint`, o `typecheck` e o `test` da raiz DEVEM passar ao final de cada Tarefa_Atomica.
