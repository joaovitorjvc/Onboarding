# Constituição do NuageHub

Última alteração: 2026-10-08

## Idioma

- Escreva comentários, documentação e mensagens ao usuário em pt-BR.
- Use identificadores de código em inglês.
- Nomeie arquivos TypeScript não-componentes em kebab-case e arquivos Python em snake_case.

## Segurança

- Mantenha segredos e credenciais fora do código versionado; documente variáveis necessárias em `.env.example`.
- Execute a revisão de segurança antes de aceitar escrita que contenha um Achado_Bloqueante ou um Achado_de_Alerta.
- Não use `eval`, `new Function`, execução de comando com entrada dinâmica, SQL concatenado ou HTML não sanitizado.
- Preserve logs estruturados sem segredos, tokens, credenciais ou stack traces em respostas públicas.
- Trate o Site_Legado como conteúdo intocável; registre qualquer necessidade de alteração como pendência de `legacy-migration`.

## Estrutura do Monorepo

- Mantenha o App_Web em `apps/web`, o App_API em `apps/api`, os Modulos_IA em `services/ai/{nome-do-modulo}` e os Pacotes_Compartilhados em `packages/`.
- Use um único workspace JavaScript, um único lockfile na raiz e `pyproject.toml` com lockfile próprio para cada Modulo_IA.
- Mantenha na raiz `.kiro/`, `CLAUDE.md`, `.claude/` e `scripts/hooks/`.
- Preserve os caminhos do Site_Legado: páginas HTML da raiz, `css/**` e `js/**`.

## Testes

- Use Vitest no App_Web, Jest no App_API e pytest nos Modulos_IA, sempre em execução única.
- Cubra critérios de aceitação testáveis, regressões corrigidas e propriedades universais.
- Mantenha testes TypeScript ao lado do código com sufixo `.test.ts` ou `.test.tsx`; mantenha testes Python em `tests/` com prefixo `test_`.
- Escreva testes de propriedade com no mínimo 100 execuções; use fast-check em TypeScript e Hypothesis em Python.
- Exija cobertura mínima de 80% das linhas novas ou alteradas no pull request.

## Contratos entre aplicações

- Mantenha contratos compartilhados em `packages/contracts`, gerados a partir do OpenAPI do App_API.
- Use o Formato_de_Erro em toda API e cliente: `code`, `message`, `correlationId`, `status` e `details` opcional.
- Faça `code` seguir o padrão de identificador em maiúsculas; mantenha `message` em pt-BR, sem stack trace; aceite `status` HTTP entre 400 e 599.
- Reserve os códigos `VALIDATION_FAILED` (400), `UNAUTHENTICATED` (401), `NOT_FOUND` (404), `INTERNAL_ERROR` (500), `AI_PROVIDER_ERROR` (502), `AI_PROVIDER_TIMEOUT` (504) e `UNEXPECTED_ERROR`.
- Preserve `correlationId` entre requisições, respostas e logs; valide contratos e preserve o status ao normalizar erros.

## Git

- Use Conventional Commits com escopo obrigatório, como `feat(web): ...`, `fix(api): ...` e `docs(standards): ...`.
- Nomeie branches como `{tipo}/{descricao-curta}` e derive-as de `main`.
- Altere `main` somente por pull request aprovado pelo Pipeline_CI.
- Não crie commit nem pull request sem solicitação explícita do usuário.
- Exija formatação, lint, testes e revisão das alterações antes de propor integração.

## Fluxo de Specs

- Siga obrigatoriamente a ordem requisitos → design → tarefas → implementação.
- Apresente cada documento ao usuário e aguarde sua revisão antes de iniciar o documento seguinte.
- Use Spec_Simples para estimativa de até 80 h, com `requirements.md`, `design.md` e `tasks.md`; promova para Spec_Epico acima de 80 h, com `epic-requirements.md`, `epic-design.md` e uma subpasta por Sub_Funcionalidade.
- Limite cada Tarefa_Atomica a uma Stack_Afetada e a no máximo 8 h; divida tarefas maiores ou que atravessem stacks.
- Faça cada item de `tasks.md` ser uma caixa de seleção com identificador, requisitos atendidos, dependências e metadados de stack e estimativa; use sub-bullets `_Requirements: x.y_`, `_Depends: a.b_` e `_Stack: stack · Est: Nh_`.
- Faça critérios de aceitação seguirem EARS e use termos definidos no glossário da Spec.
- Faça o Agente_IA verificar a Spec correspondente, executar dependências antes da tarefa e marcar a Tarefa_Atomica concluída ao terminá-la.
- Faça a Constituição prevalecer sobre Specs, Steering, `CLAUDE.md` e regras escopadas; informe conflitos e aguarde aprovação antes de prosseguir.
- Exija um ADR em `docs/adr/` em todo pull request que alterar esta Constituição.
