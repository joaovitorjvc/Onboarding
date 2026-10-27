# Resolução do executável pnpm no CLI do Windows

A alteração corrige o erro `spawn pnpm ENOENT` e `spawnSync pnpm ENOENT` no CLI ao resolver `pnpm` como `pnpm.cmd` no Windows. A resolução fica em `resolveExecutable()` e é usada tanto pelo caminho síncrono de `build`/demais tarefas quanto pelo caminho paralelo de `dev`; em Linux e macOS o comando permanece `pnpm`. O teste adjacente verifica Windows, Linux, macOS e a preservação de executáveis que não são pnpm. Não há dependências novas, alterações no Site_Legado ou interpolação de entrada dinâmica no uso restrito de `shell`.

Watch for: **confirmado** — a suíte completa de `standards` ainda retorna código 1 por falhas registradas como preexistentes e fora do escopo; o teste direcionado, lint, typecheck, formatação e o smoke test `pnpm build` passaram.

**Verdict**: APPROVED

## High-level view

A seleção do executável foi colocada junto ao executor compartilhado e reutilizada pelos caminhos `spawnSync` e `spawn`, cobrindo o `build` que reproduzia o erro e o `dev` paralelo. A condição é específica para `pnpm` no Windows, sem alterar comandos Python nem a resolução em Linux/macOS.

A regressão é determinística e independente do sistema operacional do runner: o teste exige `pnpm.cmd` em `win32`, `pnpm` em `linux` e `darwin`, e preserva `uv`. O `shell` é habilitado apenas no Windows e os argumentos usados nesses call sites são constantes ou derivados de estruturas internas do CLI, sem entrada de usuário interpolada.

A validação registrada confirma o teste direcionado, lint, typecheck, Prettier, o `pnpm build` equivalente ao smoke test e a ausência de alterações no Site_Legado. A suíte ampla falha somente em verificações preexistentes fora do escopo e não invalida os caminhos alterados.

<details>
<summary>Issues (0)</summary>

Nenhum finding bloqueante.

</details>

<details>
<summary>Details</summary>

### Resolução central e compatibilidade entre plataformas

`resolveExecutable()` é chamado pelo `spawnSync` de `run()` e pelo `spawn` de `runDevInParallel()`. Assim, os dois pontos que executavam `pnpm` diretamente passam pela mesma regra, sem duplicar condicionais nos comandos de cada stack. No Windows, o executável efetivo é `pnpm.cmd`; nos demais sistemas, continua `pnpm`.

A opção `shell: true` fica restrita ao Windows. **confirmado**: os argumentos atuais são flags, nomes de pacotes e comandos definidos pelo código; não há interpolação de entrada dinâmica na alteração. A combinação não introduz um finding de segurança neste diff e mantém o requisito de execução do wrapper `.cmd` no Windows.

### Regressão e cobertura comportamental

O repositório já possuía testes Vitest ao lado do código de `standards`, e `run.test.ts` segue essa estrutura. O teste falharia com a implementação anterior no caso `win32` e protege também Linux/macOS e executáveis não relacionados ao pnpm. Como ambos os caminhos de subprocesso usam o mesmo helper, a seleção do executável fica coberta sem iniciar servidores persistentes.

### Escopo da alteração

O diff funcional contém `packages/standards/src/cli/run.ts` e `packages/standards/src/cli/run.test.ts`. Não foram adicionadas dependências nem modificados package manifests ou lockfiles. A verificação registrada com `git diff --exit-code` confirma que `index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/**` e `js/**` não foram tocados. Os comentários e textos novos estão em pt-BR e os identificadores permanecem em inglês.

### Verificações registradas

A nota `.agents/tasks/plan.md` registra, com código 0, o teste direcionado (3 testes), lint, typecheck, Prettier e `pnpm build`; também registra que o build de `@nuagehub/web` e `@nuagehub/api` terminou sem `spawnSync pnpm ENOENT`. A checagem do Site_Legado também passou. A suíte completa de `standards` retornou código 1 por testes de commitlint/pre-write-security, caminho Windows em `commandsFor` e ausência de `uvx`, descritos na nota como falhas preexistentes fora do escopo; o teste novo passou dentro dela. Conforme solicitado, nenhuma dessas verificações foi reexecutada durante a revisão.

</details>

<details>
<summary>File map</summary>

- `packages/standards/src/cli/run.ts` — resolve `pnpm.cmd` nos caminhos síncrono e paralelo do CLI.
- `packages/standards/src/cli/run.test.ts` — testa a seleção cross-platform do executável.
- `.agents/tasks/plan.md` — registra os resultados das verificações do coder.

Diff completo inspecionado com `git diff` e contexto dos arquivos alterados.

</details>
