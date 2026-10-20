# ADR-0002: Steering em subpastas e importação no Claude Code

Última alteração: 2026-10-08 · Status: Aceito · Spec: [project-standards](../../.kiro/specs/project-standards/design.md#d1-steering-em-subpastas-adr-0002)

## Contexto

O Req. 2.1 organiza o steering em `.kiro/steering/{always,auto,conditional,manual}/`. Antes de escrever a Fonte_Canonica_de_Padroes, era preciso confirmar três coisas:

1. O Kiro carrega arquivos em subpastas de `.kiro/steering/`?
2. O Kiro aplica `inclusion: fileMatch` + `fileMatchPattern`?
3. Uma Regra_Escopada_Claude (`.claude/rules/*.md` com `paths`) consegue importar com `@` um arquivo de `.kiro/steering/`, e em que forma de caminho?

## Teste de fumaça (2026-10-08)

Ambiente: Kiro CLI 2.28.0 (agente `kiro_default`) e Claude Code 2.1.295, macOS. Cada verificação rodou numa sessão nova e não interativa (`kiro-cli chat --no-interactive`, `claude -p`). Os tokens sentinela eram aleatórios por execução, e o agente era instruído a não procurá-los no disco.

| #   | Arranjo                                                                                                                                        | Resultado                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | `steering/always/_probe.md`, `inclusion: always`                                                                                               | Token carregado. Subpastas funcionam.                                                                                                                                 |
| K2  | `steering/conditional/_probe.md`, `inclusion: fileMatch`, `fileMatchPattern: "apps/web/**"`, com leitura de `apps/web/src/_probe.ts` na sessão | Token **não** carregado.                                                                                                                                              |
| K3  | Controle: o mesmo `fileMatch` na raiz de `steering/`                                                                                           | Token **não** carregado. A falha de K2 não vem da subpasta.                                                                                                           |
| C1  | `.claude/rules/_probe.md` com `paths: ["apps/web/**"]` e corpo `@../../.kiro/steering/...`                                                     | Import resolvido, mas o alvo entrou **no início da sessão**, mesmo sem tocar em `apps/web/` (2 de 2 execuções). A regra em si só foi injetada após ler `apps/web/**`. |
| C2  | Mesmo arquivo, com `@.kiro/steering/...` (forma a partir da raiz)                                                                              | Import **não** resolvido, nem no início nem após ler `apps/web/**` (3 de 3).                                                                                          |
| C3  | `.claude/rules/_probe.md` como symlink para o arquivo em `.kiro/steering/`                                                                     | Escopo respeitado: ausente sem tocar em `apps/web/`, presente após ler `apps/web/src/_probe.ts`.                                                                      |

## Conclusões

- **Subpastas:** confirmado. O Kiro CLI varre `.kiro/steering/**/*.md` recursivamente, como diz a própria documentação. O fallback de espelhos planos da D1 **não** é necessário, e o Req. 2.7 fica como está.
- **`fileMatch` no Kiro CLI:** pela documentação do CLI, arquivos `fileMatch` e `manual` são excluídos da carga automática. Isso foi confirmado no K2 e no K3. O `fileMatchPattern` funciona no Kiro IDE, mas o Kiro CLI não carrega Steering_Conditional sozinho. No CLI, o conteúdo de React/NestJS/Python não chega ao agente sem `/context add` ou sem um agente customizado com `resources`.
- **Import `@` em `.claude/rules/`:** o Claude Code resolve só o `@` relativo ao arquivo que importa (C1), mas o arquivo importado é carregado de forma eager e ignora o `paths` da regra. A forma a partir da raiz não funciona (C2). Na prática, um corpo só com `@` anula o escopo do Req. 3.2.
- **Symlink:** mantém o escopo (C3), mas leva o front matter do Kiro para a regra do Claude. Por isso o front matter do steering conditional precisaria ter também `paths`. Além disso, symlinks quebram em clones no Windows sem `core.symlinks` e contrariam o "contendo somente a importação" do Req. 3.2.

## Teste complementar (2026-10-08, após o checkpoint)

| #   | Arranjo                                                                                                 | Resultado                                                                      |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| K4  | Agente customizado com `resources: ["file://.kiro/steering/conditional/**/*.md"]` e arquivo `fileMatch` | Token **não** carregado: o filtro de `inclusion` vale também para `resources`. |
| K5  | `inclusion: auto` em `steering/auto/`                                                                   | Token carregado em toda sessão (o CLI trata `auto` como sempre ativo).         |
| K6  | Hook `agentSpawn` imprimindo o arquivo                                                                  | Não executado em modo não interativo.                                          |
| K7  | Hook `userPromptSubmit` imprimindo o arquivo                                                            | Token carregado.                                                               |

## Decisão

1. Manter as subpastas do Req. 2.1, sem espelhos. O Req. 2.7 fica como está.
2. Kiro CLI: criar o Agente_de_Projeto_Kiro `.kiro/agents/nuagehub.json`, padrão do workspace via `.kiro/settings/cli.json`. Ele declara os hooks do projeto e um hook `userPromptSubmit` (`scripts/hooks/conditional-steering`) que entrega os Steering_Conditional cujo glob casa com arquivos alterados ou cujo diretório base é citado no prompt (Req. 2.4).
3. Claude Code: Regras_Escopadas_Claude com corpo `@../../.kiro/steering/conditional/{nome}.md`. Aceita-se que o alvo seja carregado em toda sessão (Req. 3.2). Symlinks foram descartados por violarem o "somente a importação" e por quebrarem no Windows.
4. Hooks do Kiro saem de `.kiro/hooks/` e vão para o Agente_de_Projeto_Kiro, com `preToolUse` (matcher `write`) e `stop` (Req. 4.1, 5.1). Como o Kiro CLI não tem decisão `ask`, Achados_de_Alerta bloqueiam com exit 2 e instruem o agente a pedir confirmação (Req. 4.6).

## Consequências

- Steering_Auto entra sempre no Kiro CLI e é referência sob demanda no Claude Code. O conteúdo é o mesmo; muda só o momento da carga.
- O design §3 e as tarefas 5.1, 6.7, 8.5 e 8.6 foram atualizados. As fixtures reais estão em `packages/standards/test/fixtures/hooks/`.
- Quem usar outro agente do Kiro no workspace perde os hooks do projeto; o README orienta usar `nuagehub`.
