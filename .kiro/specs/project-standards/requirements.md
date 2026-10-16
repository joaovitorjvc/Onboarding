# Requirements Document

**Estimativa_de_Esforco:** 76h (Spec_Simples)

## Introduction

O NuageHub é o portal de onboarding de novos colaboradores (foco em SDRs) da NuageIT. Hoje o repositório é um site estático com quatro páginas HTML (`index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`), uma folha de estilos única (`css/styles.css`, tema escuro baseado em variáveis CSS e fonte Inter), um script compartilhado (`js/main.js`, que persiste o checklist inicial no `localStorage`) e ícones Lucide carregados via CDN. O conteúdo é em pt-BR, os comentários de código também, e o `.gitattributes` já força finais de linha LF.

Esta Spec (`project-standards`) é a primeira do projeto e define os padrões que vão reger todas as funcionalidades futuras, enquanto o projeto evolui para:

- Frontend em React
- Backend em Node.js com NestJS
- Python para módulos de IA

Os padrões são agnósticos de ferramenta de IA. Kiro e Claude Code devem aplicar exatamente as mesmas regras, vindas da Constituicao (`.kiro/constitution.md`) e dos Arquivos_Steering, sem duplicação de conteúdo. A estrutura de referência do diretório `.kiro/` é:

```
.kiro/
├── constitution.md
├── agents/
│   └── nuagehub.json                  # agente de projeto do Kiro CLI (hooks e steering condicional)
├── settings/
│   └── cli.json                       # define nuagehub como agente padrão do workspace
├── specs/
│   ├── {funcionalidade-simples}/      # Spec_Simples (até 80h)
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── {modulo-complexo-epico}/       # Spec_Epico (acima de 80h)
│       ├── epic-requirements.md
│       ├── epic-design.md
│       └── {sub-funcionalidade}/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
└── steering/
    ├── always/
    ├── auto/
    ├── conditional/
    └── manual/
```

Escopo desta Spec:

- Dentro do escopo: Constituicao, Arquivos_Steering, paridade com o Claude Code, Hook_Seguranca, Hook_Validacao, Verificador_de_Padroes, configurações de lint, formatação e testes, Pipeline_CI, hooks Git, template de pull request, `README.md`, ADRs e o esqueleto do Monorepo. App_Web, App_API e o Modulo_IA inicial são apenas esqueletos, com o mínimo necessário para exercitar os comandos padronizados, os hooks e o Pipeline_CI. Os padrões dos Requirements 9 a 11 valem para todo código futuro e são verificados nesses esqueletos.
- Fora do escopo: a migração do Site_Legado para o App_Web, incluindo as rotas equivalentes às páginas atuais, a reprodução do conteúdo, o checklist e sua chave `nuagehub-checklist` no `localStorage`, e a substituição dos ícones e fontes carregados por CDN. Esses itens ficam para uma Spec futura, `legacy-migration`, conforme o Requirement 18.

Os critérios de aceitação seguem os padrões EARS, com as palavras-chave traduzidas: QUANDO (WHEN), ENQUANTO (WHILE), SE ... ENTÃO (IF ... THEN), ONDE (WHERE), PARA TODO (FOR ALL) e DEVE (SHALL).

## Glossary

- **Repositório**: o repositório Git do NuageHub, com raiz em `/Onboarding`.
- **Monorepo**: a organização do Repositório em que App_Web, App_API, Modulos_IA e Pacotes_Compartilhados convivem com um único histórico Git.
- **App_Web**: a aplicação frontend em React, em `apps/web`, que substituirá o Site_Legado.
- **App_API**: a aplicação backend em Node.js com NestJS, em `apps/api`.
- **Modulo_IA**: cada serviço ou biblioteca em Python dedicado a funcionalidades de IA, em `services/ai/{nome-do-modulo}`.
- **Pacote_Compartilhado**: código ou configuração reutilizado por mais de uma aplicação do Monorepo, em `packages/`.
- **Site_Legado**: o conjunto atual de arquivos estáticos (`*.html`, `css/styles.css`, `js/main.js`).
- **Constituicao**: o arquivo `.kiro/constitution.md`, fonte canônica e inegociável das regras de engenharia do Repositório. Prevalece sobre qualquer outro documento de padrões.
- **Arquivo_Steering**: arquivo Markdown em `.kiro/steering/{modo}/` que detalha regras da Constituicao para um contexto específico.
- **Fonte_Canonica_de_Padroes**: o conjunto formado pela Constituicao e pelos Arquivos_Steering. É o único local onde regras de padrão são escritas.
- **Front_Matter**: bloco YAML no início de um Arquivo_Steering que define o modo de inclusão (`inclusion`) e campos associados (`name`, `description`, `fileMatchPattern`).
- **Steering_Always**: Arquivo_Steering em `.kiro/steering/always/`, injetado em toda interação.
- **Steering_Auto**: Arquivo_Steering em `.kiro/steering/auto/`, injetado por relevância semântica à descrição.
- **Steering_Conditional**: Arquivo_Steering em `.kiro/steering/conditional/`, injetado quando arquivos que casam com um glob estão no contexto.
- **Steering_Manual**: Arquivo_Steering em `.kiro/steering/manual/`, injetado somente sob demanda explícita do desenvolvedor.
- **Arquivo_CLAUDE**: o arquivo `CLAUDE.md` na raiz do Repositório, lido pelo Claude Code como contexto.
- **Regra_Escopada_Claude**: arquivo em `.claude/rules/` com escopo por glob de caminho, ou `CLAUDE.md` em subpasta, que entrega ao Claude Code uma regra aplicável a parte do Repositório.
- **Agente_IA**: qualquer assistente de IA que gera ou altera código no Repositório, incluindo Kiro e Claude Code.
- **Agente_de_Projeto_Kiro**: o arquivo `.kiro/agents/nuagehub.json`, agente do Kiro CLI que declara os hooks do projeto e entrega os Steering_Conditional (ver ADR-0002).
- **Hook_Seguranca**: o hook `preToolUse` de escrita declarado no Agente_de_Projeto_Kiro e seu equivalente no Claude Code, executados antes da escrita de arquivos em disco.
- **Hook_Validacao**: o hook `stop` declarado no Agente_de_Projeto_Kiro e seu equivalente no Claude Code, executados ao fim de cada turno do Agente_IA.
- **Script_de_Hook**: script versionado em `scripts/hooks/` que contém a lógica executada pelos hooks de Kiro e Claude Code.
- **Achado_Bloqueante**: resultado do Hook_Seguranca de categoria crítica: segredo ou credencial hardcoded, injeção de SQL, injeção de comando, uso de `eval`/`new Function`/`exec` com entrada dinâmica, ou `dangerouslySetInnerHTML` com conteúdo não sanitizado.
- **Achado_de_Alerta**: resultado do Hook_Seguranca que indica risco OWASP fora das categorias de Achado_Bloqueante (por exemplo, desserialização insegura, desativação de verificação TLS, CORS permissivo).
- **Stack_Afetada**: cada aplicação ou Modulo_IA que contém ao menos um arquivo alterado na tarefa corrente.
- **Spec**: conjunto de documentos de uma iniciativa em `.kiro/specs/{nome-da-spec}/`, no formato Spec_Simples ou Spec_Epico.
- **Estimativa_de_Esforco**: o número de horas estimado para implementar uma Spec ou Sub_Funcionalidade, registrado no cabeçalho do documento de requisitos.
- **Spec_Simples**: Spec com Estimativa_de_Esforco de até 80 horas, composta por `requirements.md`, `design.md` e `tasks.md`.
- **Spec_Epico**: Spec com Estimativa_de_Esforco acima de 80 horas, composta por `epic-requirements.md`, `epic-design.md` e uma ou mais Sub_Funcionalidades.
- **Sub_Funcionalidade**: subpasta de uma Spec_Epico com `requirements.md`, `design.md` e `tasks.md` próprios.
- **Tarefa_Atomica**: item do `tasks.md` com um único resultado verificável, que altera no máximo uma Stack_Afetada e tem estimativa de até 8 horas.
- **Verificador_de_Padroes**: o mecanismo automatizado (script local e etapa do Pipeline_CI) que valida a conformidade do Repositório com os padrões.
- **Pipeline_CI**: o fluxo de integração contínua executado a cada push e pull request.
- **Tokens_de_Design**: os valores visuais nomeados (cores, tipografia, raios, espaçamentos) hoje definidos como variáveis CSS em `:root` no `css/styles.css`.
- **Formato_de_Erro**: o formato padronizado de erro do projeto, contendo código, mensagem e identificador de correlação.
- **Conventional_Commits**: a especificação Conventional Commits 1.0.0 para mensagens de commit.

## Requirements

### Requirement 1: Constituição como fonte canônica

**User Story:** Como tech lead, quero que as regras inegociáveis de engenharia morem em um único arquivo, para que Kiro, Claude Code e pessoas sigam o mesmo DNA do projeto.

#### Acceptance Criteria

1. O Repositório DEVE conter exatamente uma Constituicao, no caminho `.kiro/constitution.md`.
2. A Constituicao DEVE conter as regras inegociáveis das áreas: idioma, segurança, estrutura do Monorepo, testes, contratos entre aplicações, Git e fluxo de Specs.
3. Cada Arquivo_Steering DEVE detalhar ou especializar regras da Constituicao para o seu contexto, mantendo conformidade com a Constituicao.
4. SE um Arquivo_Steering, o Arquivo_CLAUDE ou uma Regra_Escopada_Claude conflitar com a Constituicao, ENTÃO o Agente_IA DEVE aplicar a regra da Constituicao e informar o conflito ao usuário.
5. A Constituicao e cada Arquivo_Steering DEVEM registrar no cabeçalho a data da última alteração.
6. QUANDO a Constituicao for alterada, o pull request da alteração DEVE incluir um ADR em `docs/adr/` justificando a mudança.

### Requirement 2: Organização do steering por modo de inclusão

**User Story:** Como desenvolvedor, quero que o steering seja organizado pelo modo de inclusão, para que eu saiba quando cada regra entra no contexto do Agente_IA.

#### Acceptance Criteria

1. O Repositório DEVE organizar os Arquivos_Steering nas subpastas `.kiro/steering/always/`, `.kiro/steering/auto/`, `.kiro/steering/conditional/` e `.kiro/steering/manual/`.
2. Cada Steering_Always DEVE declarar `inclusion: always` no Front_Matter ou omitir o campo `inclusion`.
3. Cada Steering_Auto DEVE declarar `inclusion: auto` no Front_Matter, acompanhado dos campos `name` e `description` não vazios.
4. Cada Steering_Conditional DEVE declarar `inclusion: fileMatch` no Front_Matter, acompanhado do campo `fileMatchPattern` com glob de caminho (por exemplo, `apps/web/**/*.tsx`, `apps/api/**/*.ts`, `services/ai/**/*.py`). Como o Kiro CLI não aplica `fileMatch` (ADR-0002), o Agente_de_Projeto_Kiro DEVE entregar ao agente, por hook `userPromptSubmit`, cada Steering_Conditional cujo glob case com um arquivo alterado no Repositório ou cujo diretório base seja citado no prompt.
5. Cada Steering_Manual DEVE declarar `inclusion: manual` no Front_Matter.
6. SE o modo de inclusão declarado no Front_Matter de um Arquivo_Steering divergir da subpasta em que o arquivo está, ENTÃO o Verificador_de_Padroes DEVE falhar e listar o caminho do arquivo, o modo esperado e o modo encontrado.
7. SE um Arquivo_Steering estiver diretamente em `.kiro/steering/`, fora das quatro subpastas, ENTÃO o Verificador_de_Padroes DEVE falhar e listar o caminho do arquivo.
8. O Repositório DEVE manter as regras específicas de React, NestJS e Python em Steering_Conditional com `fileMatchPattern` restrito aos caminhos de App_Web, App_API e Modulos_IA, respectivamente.

### Requirement 3: Paridade com o Claude Code

**User Story:** Como desenvolvedor que usa Claude Code, quero receber exatamente as mesmas regras que o Kiro recebe, para que o resultado não dependa da ferramenta.

#### Acceptance Criteria

1. O Arquivo_CLAUDE DEVE importar a Constituicao e cada Steering_Always por meio de importações `@caminho`.
2. O Repositório DEVE fornecer, para cada Steering_Conditional, uma Regra_Escopada_Claude com o mesmo glob de caminho do `fileMatchPattern`, contendo somente a importação `@` relativa ao arquivo da regra (por exemplo, `@../../.kiro/steering/conditional/react.md`) do Steering_Conditional correspondente. O Claude Code carrega o arquivo importado no início da sessão, independentemente de `paths` (ADR-0002); essa limitação é aceita.
3. O Arquivo_CLAUDE DEVE listar cada Steering_Auto e cada Steering_Manual como referência sob demanda, com o caminho do arquivo e a descrição de quando lê-lo.
4. O Arquivo_CLAUDE e cada Regra_Escopada_Claude DEVEM conter somente importações, referências e instruções de navegação, mantendo o conteúdo das regras exclusivamente na Fonte_Canonica_de_Padroes.
5. SE o conjunto de Arquivos_Steering referenciados pelo Arquivo_CLAUDE e pelas Regras_Escopadas_Claude divergir do conjunto de Arquivos_Steering existentes, ENTÃO o Verificador_de_Padroes DEVE falhar e listar os arquivos ausentes ou excedentes.
6. SE o glob de uma Regra_Escopada_Claude divergir do `fileMatchPattern` do Steering_Conditional correspondente, ENTÃO o Verificador_de_Padroes DEVE falhar e listar os dois globs.
7. SE o Arquivo_CLAUDE ou uma Regra_Escopada_Claude contiver texto de regra que não exista na Fonte_Canonica_de_Padroes, ENTÃO o Verificador_de_Padroes DEVE falhar e listar o arquivo e a seção divergentes.

### Requirement 4: Hook de segurança pré-escrita

**User Story:** Como tech lead, quero uma varredura de segurança antes de qualquer escrita em disco feita por um Agente_IA, para que vulnerabilidades OWASP comuns sejam barradas na origem.

#### Acceptance Criteria

1. O Agente_de_Projeto_Kiro DEVE declarar um hook de gatilho `preToolUse` com matcher `write`, a ferramenta de escrita, edição e append de arquivos do Kiro CLI.
2. O Repositório DEVE conter em `.claude/settings.json` um hook `PreToolUse` com matcher `Write|Edit|MultiEdit` (`MultiEdit` mantido por compatibilidade com versões que ainda o expõem).
3. O hook do Kiro e o hook do Claude Code DEVEM executar o mesmo Script_de_Hook `scripts/hooks/pre-write-security`, que concentra toda a lógica da varredura.
4. QUANDO um Agente_IA solicitar a escrita de um arquivo, o Hook_Seguranca DEVE analisar o conteúdo a ser escrito em busca de Achados_Bloqueantes e Achados_de_Alerta.
5. SE o Hook_Seguranca encontrar um Achado_Bloqueante, ENTÃO o Hook_Seguranca DEVE bloquear a escrita com código de saída 2 e informar em stderr o arquivo, a linha, a categoria do achado e a correção sugerida.
6. SE o Hook_Seguranca encontrar somente Achados_de_Alerta, ENTÃO o Hook_Seguranca DEVE solicitar confirmação do usuário com a lista dos achados: no Claude Code por `permissionDecision: ask`; no Kiro CLI, que não tem decisão `ask`, bloqueando com código de saída 2 e instruindo o Agente_IA a pedir confirmação ao usuário antes de repetir a escrita com supressão justificada.
7. QUANDO o Hook_Seguranca não encontrar achados, o Hook_Seguranca DEVE permitir a escrita com código de saída 0.
8. SE o Script_de_Hook falhar por erro interno, ENTÃO o Hook_Seguranca DEVE solicitar confirmação do usuário informando o erro.
9. QUANDO o Hook_Seguranca analisar um arquivo de até 1 MB, o Hook_Seguranca DEVE concluir a análise em até 5 segundos.
10. ONDE um trecho de código for falso positivo confirmado, o Hook_Seguranca DEVE aceitar supressão por comentário inline com a categoria suprimida e a justificativa.

### Requirement 5: Hook de validação pós-tarefa

**User Story:** Como desenvolvedor, quero que os testes das stacks afetadas rodem automaticamente ao fim de cada tarefa, para que regressões apareçam antes do commit.

#### Acceptance Criteria

1. O Agente_de_Projeto_Kiro DEVE declarar um hook de gatilho `stop` (o Kiro CLI não tem `PostTaskExec`).
2. O Repositório DEVE conter em `.claude/settings.json` um hook `Stop` que execute a mesma validação.
3. O hook do Kiro e o hook do Claude Code DEVEM executar o mesmo Script_de_Hook `scripts/hooks/post-task-validation`, que concentra toda a lógica da validação.
4. QUANDO uma tarefa for concluída, o Hook_Validacao DEVE identificar as Stacks_Afetadas a partir dos arquivos alterados.
5. QUANDO o App_Web for Stack_Afetada, o Hook_Validacao DEVE executar lint, verificação de tipos e testes do App_Web com Vitest em modo de execução única.
6. QUANDO o App_API for Stack_Afetada, o Hook_Validacao DEVE executar lint, verificação de tipos e testes do App_API com Jest em modo de execução única.
7. QUANDO um Modulo_IA for Stack_Afetada, o Hook_Validacao DEVE executar lint, verificação de tipos e testes do Modulo_IA com pytest.
8. SE alguma verificação do Hook_Validacao falhar, ENTÃO o Hook_Validacao DEVE reportar ao Agente_IA a Stack_Afetada, a verificação que falhou e a saída resumida do erro.
9. QUANDO nenhuma Stack_Afetada for identificada, o Hook_Validacao DEVE encerrar com código de saída 0 sem executar testes.
10. SE a configuração de hooks do Kiro e a de `.claude/settings.json` referenciarem conjuntos diferentes de Scripts_de_Hook, ENTÃO o Verificador_de_Padroes DEVE falhar e listar os scripts divergentes.

### Requirement 6: Dimensionamento e estrutura de Specs

**User Story:** Como tech lead, quero que o tamanho da iniciativa determine a estrutura da Spec, para que funcionalidades simples sejam leves e épicos tenham regras globais explícitas.

#### Acceptance Criteria

1. O Repositório DEVE armazenar cada Spec em `.kiro/specs/{nome-da-spec}/`, com nome em kebab-case.
2. O documento de requisitos de cada Spec_Simples, Spec_Epico e Sub_Funcionalidade DEVE registrar a Estimativa_de_Esforco em horas no cabeçalho.
3. QUANDO a Estimativa_de_Esforco de uma Spec for de até 80 horas, a Spec DEVE seguir o formato Spec_Simples, com `requirements.md`, `design.md` e `tasks.md`.
4. QUANDO a Estimativa_de_Esforco de uma Spec for acima de 80 horas, a Spec DEVE seguir o formato Spec_Epico, com `epic-requirements.md`, `epic-design.md` e uma subpasta por Sub_Funcionalidade.
5. O `epic-requirements.md` DEVE conter as regras globais do módulo, incluindo requisitos legais e de compliance aplicáveis (por exemplo, LGPD).
6. O `epic-design.md` DEVE conter a arquitetura macro do módulo, incluindo o modelo de dados compartilhado entre as Sub_Funcionalidades.
7. O `requirements.md` e o `design.md` de cada Sub_Funcionalidade DEVEM referenciar por link relativo o `epic-requirements.md` e o `epic-design.md` do épico.
8. SE um requisito ou decisão de design de uma Sub_Funcionalidade conflitar com o `epic-requirements.md` ou o `epic-design.md`, ENTÃO o Agente_IA DEVE informar o conflito ao usuário e propor a alteração do documento do épico antes de prosseguir.
9. SE a Estimativa_de_Esforco de uma Spec_Simples ultrapassar 80 horas, ENTÃO o Agente_IA DEVE propor ao usuário a promoção da Spec para Spec_Epico antes de continuar a implementação.
10. SE a Estimativa_de_Esforco de uma Sub_Funcionalidade ultrapassar 80 horas, ENTÃO o Agente_IA DEVE propor a divisão da Sub_Funcionalidade.
11. SE a estrutura de arquivos de uma Spec divergir do formato correspondente à sua Estimativa_de_Esforco, ENTÃO o Verificador_de_Padroes DEVE falhar e listar a Spec, a estimativa e os arquivos ausentes.
12. O documento de requisitos de cada Spec DEVE expressar critérios de aceitação nos padrões EARS e usar termos definidos em glossário.
13. O `tasks.md` DEVE listar somente Tarefas_Atomicas, cada uma com caixa de seleção Markdown, identificador, requisitos atendidos e identificadores das tarefas das quais depende.
14. SE uma dependência declarada no `tasks.md` referenciar tarefa inexistente ou formar ciclo, ENTÃO o Verificador_de_Padroes DEVE falhar e listar as tarefas envolvidas.
15. A Constituicao DEVE documentar o fluxo de Spec (requisitos → design → tarefas → implementação) e as regras de dimensionamento de forma que um Agente_IA sem suporte nativo a Specs execute o mesmo fluxo lendo apenas arquivos Markdown.
16. QUANDO um Agente_IA criar uma Spec, o Agente_IA DEVE apresentar cada documento ao usuário para revisão antes de iniciar o documento seguinte.
17. SE uma Spec precisar de uma regra que contradiz a Constituicao, ENTÃO a Spec DEVE aguardar a alteração aprovada da Constituicao, conforme o Requirement 1.

### Requirement 7: Comportamento obrigatório dos Agentes_IA

**User Story:** Como desenvolvedor, quero que qualquer Agente_IA siga o mesmo protocolo de trabalho, para que o resultado seja previsível independentemente da ferramenta usada.

#### Acceptance Criteria

1. QUANDO um Agente_IA for solicitado a implementar uma nova funcionalidade, o Agente_IA DEVE verificar se existe Spec correspondente em `.kiro/specs/` e seguir as Tarefas_Atomicas definidas nela.
2. SE não existir Spec para uma nova funcionalidade que altere mais de uma aplicação do Monorepo ou crie endpoint, página ou Modulo_IA, ENTÃO o Agente_IA DEVE propor a criação da Spec antes de escrever código.
3. QUANDO um Agente_IA executar uma Tarefa_Atomica, o Agente_IA DEVE executar as tarefas das quais ela depende antes dela.
4. QUANDO um Agente_IA concluir uma Tarefa_Atomica, o Agente_IA DEVE marcar a tarefa como concluída no `tasks.md` da Spec.
5. SE uma regra da Fonte_Canonica_de_Padroes conflitar com uma instrução explícita do usuário, ENTÃO o Agente_IA DEVE informar o conflito ao usuário e aguardar confirmação antes de prosseguir.
6. O Agente_IA DEVE redigir comentários de código, documentação e mensagens para o usuário em pt-BR, e identificadores de código (variáveis, funções, classes, arquivos) em inglês.
7. SE uma tarefa exigir adicionar uma dependência externa, ENTÃO o Agente_IA DEVE fixar a versão exata e justificar a escolha na descrição da alteração.
8. O Agente_IA DEVE manter segredos e credenciais fora do código versionado, usando variáveis de ambiente documentadas em arquivo `.env.example`.
9. O Agente_IA DEVE criar commits ou abrir pull requests somente quando o usuário solicitar explicitamente.

### Requirement 8: Estrutura do Monorepo

**User Story:** Como desenvolvedor, quero uma estrutura de pastas previsível, para que eu saiba onde cada tipo de código deve ficar.

#### Acceptance Criteria

1. O Repositório DEVE organizar aplicações em `apps/` (`apps/web` para o App_Web e `apps/api` para o App_API), Modulos_IA em `services/ai/{nome-do-modulo}` e Pacotes_Compartilhados em `packages/`.
2. O Repositório DEVE manter na raiz o diretório `.kiro/` (com `constitution.md`, `agents/nuagehub.json`, `specs/` e `steering/`), o Arquivo_CLAUDE, o diretório `.claude/` e o diretório `scripts/hooks/`.
3. O Repositório DEVE usar um único gerenciador de pacotes JavaScript com workspaces para App_Web, App_API e Pacotes_Compartilhados, com um único lockfile versionado na raiz.
4. Cada Modulo_IA DEVE declarar suas dependências em um `pyproject.toml` próprio, com lockfile versionado.
5. Cada aplicação e Modulo_IA DEVE conter um `README.md` com propósito, comandos de execução, comandos de teste e variáveis de ambiente necessárias.
6. O Repositório DEVE expor na raiz os comandos padronizados `dev`, `build`, `lint`, `typecheck` e `test`, que executem a ação correspondente nas aplicações afetadas.
7. O Repositório DEVE fixar as versões de Node.js e Python em arquivos de versão na raiz (`.nvmrc` e `.python-version`), usando versões LTS ou estáveis com suporte ativo.
8. O Repositório DEVE conter, como esqueletos, o App_Web com uma página inicial, o App_API com um endpoint de verificação de saúde marcado como público nesta Spec e um Modulo_IA de exemplo, cada um com ao menos um teste automatizado acionável pelo comando `test` da raiz.

### Requirement 9: Padrões do frontend React

**User Story:** Como desenvolvedor frontend, quero convenções claras para React, para que os componentes sejam consistentes e fáceis de manter.

#### Acceptance Criteria

1. O App_Web DEVE ser escrito em TypeScript com modo `strict` habilitado.
2. O App_Web DEVE usar exclusivamente componentes funcionais e hooks.
3. O App_Web DEVE nomear componentes em PascalCase, com um componente exportado por arquivo e nome do arquivo igual ao nome do componente.
4. O App_Web DEVE nomear hooks customizados com o prefixo `use` em camelCase.
5. O App_Web DEVE organizar o código por funcionalidade em `src/features/{feature}/`, mantendo componentes genéricos reutilizáveis em `src/components/`.
6. O App_Web DEVE centralizar os Tokens_de_Design em um único módulo, preservando os valores visuais do Site_Legado (paleta escura, cor primária `#4f46e5`, fonte Inter).
7. O App_Web DEVE acessar o App_API somente por uma camada de cliente HTTP dedicada, mantendo os componentes de apresentação livres de chamadas de rede.
8. O App_Web DEVE manter o conteúdo textual da interface em pt-BR.
9. O App_Web DEVE atender aos critérios WCAG 2.1 nível AA verificáveis automaticamente, incluindo rótulos acessíveis, navegação por teclado e indicação de foco visível.
10. O App_Web DEVE tipar as props de cada componente com tipos TypeScript explícitos.

### Requirement 10: Padrões do backend NestJS

**User Story:** Como desenvolvedor backend, quero convenções claras para NestJS, para que a API tenha estrutura e contratos consistentes.

#### Acceptance Criteria

1. O App_API DEVE ser escrito em TypeScript com modo `strict` habilitado.
2. O App_API DEVE organizar o código em módulos NestJS por domínio, cada módulo contendo seus controllers, services e DTOs.
3. O App_API DEVE nomear arquivos em kebab-case com sufixo do tipo de artefato (por exemplo, `checklist.controller.ts`, `checklist.service.ts`, `create-checklist.dto.ts`).
4. QUANDO uma requisição chegar a um endpoint, o App_API DEVE validar o corpo, os parâmetros e a query contra DTOs declarados antes de executar a regra de negócio.
5. SE a validação de uma requisição falhar, ENTÃO o App_API DEVE responder com status HTTP 400 e corpo no Formato_de_Erro.
6. SE ocorrer erro não tratado, ENTÃO o App_API DEVE responder com status HTTP 500 e corpo no Formato_de_Erro, omitindo o stack trace da resposta, e registrar o erro em log estruturado.
7. O App_API DEVE manter a regra de negócio em services e restringir os controllers ao mapeamento entre HTTP e services.
8. O App_API DEVE prefixar as rotas com versão (por exemplo, `/api/v1`).
9. O App_API DEVE gerar documentação OpenAPI a partir dos DTOs e controllers.
10. O App_API DEVE ler configuração somente por variáveis de ambiente validadas na inicialização.
11. SE uma variável de ambiente obrigatória estiver ausente ou inválida na inicialização, ENTÃO o App_API DEVE encerrar a inicialização com mensagem que identifique a variável.
12. O App_API DEVE exigir autenticação em todo endpoint, exceto nos endpoints explicitamente marcados como públicos na Spec correspondente.

### Requirement 11: Padrões dos Modulos_IA em Python

**User Story:** Como desenvolvedor de IA, quero convenções claras para Python, para que novos módulos de IA sigam o mesmo nível de qualidade do restante do projeto.

#### Acceptance Criteria

1. Cada Modulo_IA DEVE usar type hints em todas as funções públicas e passar na verificação estática de tipos configurada no projeto.
2. Cada Modulo_IA DEVE seguir PEP 8, com nomes de módulos e funções em snake_case e classes em PascalCase, validados pelo linter e formatador configurados no projeto.
3. Cada Modulo_IA DEVE usar layout `src/`, com o pacote em `src/{nome_do_modulo}/` e testes em `tests/`.
4. ONDE um Modulo_IA for exposto como serviço, o Modulo_IA DEVE publicar uma API HTTP com contrato OpenAPI consumido pelo App_API.
5. O App_Web DEVE acessar funcionalidades de um Modulo_IA somente por meio do App_API.
6. Cada Modulo_IA DEVE ler chaves de provedores de IA e demais segredos somente por variáveis de ambiente.
7. QUANDO um Modulo_IA chamar um provedor externo de IA, o Modulo_IA DEVE aplicar tempo limite configurável e registrar em log estruturado a duração e o resultado da chamada, omitindo segredos do log.
8. SE uma chamada a um provedor externo de IA falhar ou exceder o tempo limite, ENTÃO o Modulo_IA DEVE retornar um erro no Formato_de_Erro.

### Requirement 12: Nomenclatura e formatação transversais

**User Story:** Como desenvolvedor, quero regras de nomenclatura e formatação comuns, para que o código pareça escrito por uma única pessoa.

#### Acceptance Criteria

1. O Repositório DEVE nomear pastas e arquivos não-componentes em kebab-case no código TypeScript e em snake_case no código Python.
2. O Repositório DEVE usar codificação UTF-8 e finais de linha LF em todos os arquivos de texto, conforme o `.gitattributes` existente.
3. O Repositório DEVE conter um `.editorconfig` na raiz com indentação de 2 espaços para TypeScript, JSON, CSS, HTML e Markdown, e 4 espaços para Python.
4. O Repositório DEVE configurar formatador e linter para TypeScript e para Python, com a configuração versionada em um único local por linguagem.
5. QUANDO um arquivo for formatado duas vezes seguidas pelo formatador configurado, o formatador DEVE produzir na segunda execução o mesmo conteúdo da primeira (idempotência).

### Requirement 13: Contratos entre aplicações

**User Story:** Como desenvolvedor full stack, quero contratos de API tipados e compartilhados, para que frontend, backend e módulos de IA não quebrem uns aos outros.

#### Acceptance Criteria

1. O Repositório DEVE manter os tipos de contrato entre App_Web e App_API em um Pacote_Compartilhado, gerado a partir da especificação OpenAPI do App_API.
2. O App_API e os Modulos_IA DEVEM usar o mesmo Formato_de_Erro, definido uma única vez em um Pacote_Compartilhado e documentado na Constituicao.
3. QUANDO um DTO do App_API for alterado, o Pipeline_CI DEVE verificar que os tipos do Pacote_Compartilhado estão atualizados em relação à especificação OpenAPI.
4. PARA TODO objeto válido no Formato_de_Erro, serializar em JSON e desserializar DEVE produzir um objeto equivalente ao original (round-trip).
5. SE um payload de erro recebido pelo cliente HTTP do App_Web não respeitar o Formato_de_Erro, ENTÃO o cliente HTTP do App_Web DEVE convertê-lo em erro genérico no Formato_de_Erro preservando o status HTTP.

### Requirement 14: Padrões de testes

**User Story:** Como tech lead, quero padrões mínimos de testes, para que toda funcionalidade nova chegue verificada.

#### Acceptance Criteria

1. O App_Web DEVE usar Vitest, o App_API DEVE usar Jest e cada Modulo_IA DEVE usar pytest, todos acionáveis pelo comando `test` da raiz em modo de execução única.
2. QUANDO uma funcionalidade nova for implementada, a alteração DEVE incluir testes automatizados que cubram cada critério de aceitação testável da Spec correspondente.
3. QUANDO um critério de aceitação descrever uma propriedade válida para todas as entradas (invariante, round-trip, idempotência), os testes DEVEM incluir teste baseado em propriedades.
4. QUANDO um bug for corrigido, a correção DEVE incluir um teste que falha sem a correção e passa com ela.
5. O Pipeline_CI DEVE exigir cobertura mínima de 80% das linhas no código novo ou alterado de cada pull request.
6. Os testes DEVEM ficar ao lado do código testado com sufixo `.test.ts`/`.test.tsx` no TypeScript, e em `tests/` com prefixo `test_` no Python.

### Requirement 15: Convenções de Git e commits

**User Story:** Como desenvolvedor, quero um histórico Git padronizado, para que mudanças sejam rastreáveis e revisáveis.

#### Acceptance Criteria

1. O Repositório DEVE exigir mensagens de commit no formato Conventional_Commits, com escopo indicando a área afetada (por exemplo, `feat(web): ...`, `fix(api): ...`, `docs(standards): ...`).
2. O Repositório DEVE usar branches nomeadas como `{tipo}/{descricao-curta}` (por exemplo, `feat/checklist-api`), derivadas de `main`.
3. O Repositório DEVE aceitar alterações em `main` somente via pull request com Pipeline_CI aprovado.
4. SE uma mensagem de commit não seguir Conventional_Commits, ENTÃO o hook Git local de commit DEVE rejeitar o commit com mensagem que indique o formato esperado.
5. O Repositório DEVE fornecer um template de pull request com seções para resumo das mudanças, link para a Spec relacionada e o que foi testado.

### Requirement 16: Documentação

**User Story:** Como novo desenvolvedor, quero documentação mínima e atualizada, para que eu consiga contribuir sem depender de conversas informais.

#### Acceptance Criteria

1. O Repositório DEVE conter um `README.md` na raiz descrevendo o propósito do NuageHub, a estrutura do Monorepo, a estrutura do `.kiro/`, os pré-requisitos e os comandos padronizados.
2. O Repositório DEVE registrar decisões de arquitetura relevantes como ADRs numerados em `docs/adr/`.
3. QUANDO uma alteração modificar comandos, variáveis de ambiente ou estrutura de uma aplicação, a mesma alteração DEVE atualizar o `README.md` dessa aplicação.
4. QUANDO uma regra de padrão for alterada, a mesma alteração DEVE atualizar o documento correspondente da Fonte_Canonica_de_Padroes e a data no cabeçalho desse documento.

### Requirement 17: Verificação automatizada de padrões

**User Story:** Como tech lead, quero que os padrões sejam verificados automaticamente, para que a conformidade não dependa só da disciplina de pessoas ou da ferramenta de IA usada.

#### Acceptance Criteria

1. QUANDO um pull request for aberto ou atualizado, o Pipeline_CI DEVE executar lint, verificação de tipos, testes, verificação de commits, o Script_de_Hook `scripts/hooks/pre-write-security` sobre os arquivos alterados e o Verificador_de_Padroes.
2. SE qualquer verificação do Pipeline_CI falhar, ENTÃO o Pipeline_CI DEVE bloquear o merge do pull request.
3. O Repositório DEVE fornecer hooks Git locais que executem formatação e lint nos arquivos alterados antes do commit.
4. O Verificador_de_Padroes DEVE ser executável localmente por um único comando da raiz.
5. QUANDO o Verificador_de_Padroes falhar, o Verificador_de_Padroes DEVE encerrar com código de saída diferente de zero e listar cada violação com o caminho do arquivo e o requisito desta Spec violado.
6. QUANDO o Verificador_de_Padroes for executado localmente sem alterações no Repositório, o Verificador_de_Padroes DEVE concluir em até 30 segundos.

### Requirement 18: Preservação do Site_Legado

**User Story:** Como product owner, quero que a adoção dos padrões não afete o site atual, para que os colaboradores continuem usando o NuageHub enquanto a migração para React é planejada em Spec própria.

#### Acceptance Criteria

1. A migração do Site_Legado para o App_Web DEVE ser tratada por uma Spec separada, `legacy-migration`, criada conforme o Requirement 6.
2. ENQUANTO a Spec `legacy-migration` não estiver concluída, o Repositório DEVE manter os arquivos do Site_Legado na raiz, com os caminhos e o conteúdo atuais.
3. QUANDO a implementação desta Spec for concluída, o Site_Legado DEVE continuar funcional, com as quatro páginas carregando estilos, ícones e script, e o checklist inicial persistindo o estado como antes.
4. SE uma regra desta Spec exigir alteração em arquivo do Site_Legado, ENTÃO a alteração DEVE ser registrada como pendência da Spec `legacy-migration`, mantendo o arquivo do Site_Legado inalterado.
5. O Verificador_de_Padroes, o Hook_Validacao e os hooks Git locais DEVEM excluir os arquivos do Site_Legado das verificações de App_Web, App_API e Modulos_IA.
