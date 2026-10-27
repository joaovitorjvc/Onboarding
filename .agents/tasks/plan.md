# Implementation Plan

- [x] 1. Corrigir a resolução cross-platform do executável pnpm no ponto central do CLI.
      A causa raiz está confirmada pela leitura de `packages/standards/src/cli/run.ts`: `run()` chama `spawnSync(command[0], ...)` e `runDevInParallel()` chama `spawn('pnpm', ...)`; os argumentos vêm de `commandsFor()` em `packages/standards/src/validation/stacks.ts`, mas nenhum ponto converte `pnpm` para `pnpm.cmd` no Windows. Como `pnpm` funciona diretamente no PowerShell e o erro ocorre somente quando o Node cria o subprocesso, a falha é a resolução de executável `.cmd` pelo `child_process` sem shell.
      Implementar em `packages/standards/src/cli/run.ts` uma função pequena e testável para resolver o executável (`pnpm.cmd` quando `process.platform === 'win32'`, `pnpm` nos demais sistemas), e fazer tanto `run()` quanto `runDevInParallel()` passarem por essa função. Não usar `shell: true`: a escolha explícita do executável evita interpretação de argumentos e preserva a segurança. Não alterar a montagem de comandos Python (`uv`) nem adicionar dependências.
      Arquivos: `packages/standards/src/cli/run.ts`
      Contexto/Spec: a mudança é coberta pela Spec existente `.kiro/specs/project-standards/`; a Tarefa_Atomica aplicável é `14.1` (fiação de `run.ts` para os comandos padronizados), já marcada como concluída e ajustada por esta correção local. Não criar uma Spec nova, pois a correção não cria aplicação, endpoint, página ou módulo e permanece na stack `standards`.
      Verificar: `pnpm --filter @nuagehub/standards typecheck` deve concluir sem erros; `pnpm --filter @nuagehub/standards lint` deve concluir sem erros.

- [x] 2. Adicionar teste de regressão unitário para a seleção do executável.
      Criar teste ao lado do CLI, seguindo o runner Vitest já configurado em `packages/standards/vitest.config.ts` e o padrão dos testes em `packages/standards/src/validation/*.test.ts`. Cobrir explicitamente Windows (`win32` retorna `pnpm.cmd`) e Linux/macOS (`linux`/`darwin` retornam `pnpm`), usando a função pura ou parâmetro de plataforma exposto pelo passo 1; assim o teste não depende do sistema operacional em que a suíte roda. O teste deve falhar com a implementação anterior, que sempre usava `pnpm`, e validar também que o restante do comando/argumentos permanece inalterado se a implementação os expuser para teste. Não criar teste de integração que deixe `pnpm dev` executando.
      Arquivos: `packages/standards/src/cli/run.test.ts` (novo); se necessário, `packages/standards/src/cli/run.ts` para exportar somente o helper de resolução sem executar `main()` durante importação.
      Verificar: `pnpm --filter @nuagehub/standards exec vitest run src/cli/run.test.ts` deve passar todos os testes novos em execução única.

- [x] 3. Executar as verificações direcionadas e a validação completa do smoke test raiz.
      Rodar primeiro a suíte direcionada e depois as verificações da stack `standards`; conferir que não há alteração no Site_Legado. Por fim, executar o equivalente solicitado ao smoke test real: `pnpm build` na raiz. O resultado esperado é exit code 0, com `@nuagehub/web` e `@nuagehub/api` construídos sem `spawnSync pnpm ENOENT`; a execução não deve iniciar servidor persistente. Não executar `pnpm dev`, pois ele mantém servidores em execução; se for necessário verificar o caminho de desenvolvimento, usar somente o teste unitário do passo 2.
      Arquivos: nenhum arquivo adicional; validar `packages/standards/src/cli/run.ts`, `packages/standards/src/cli/run.test.ts` e o diff do repositório.
      Verificar: `pnpm --filter @nuagehub/standards exec vitest run src/cli/run.test.ts`; `pnpm --filter @nuagehub/standards test`; `pnpm --filter @nuagehub/standards lint`; `pnpm --filter @nuagehub/standards typecheck`; `pnpm build`; `git diff --exit-code -- index.html primeiros-passos.html plataformas.html playbook.html css js` deve não reportar alterações. Se disponível no ambiente, executar também `pnpm format:check` e confirmar que não há mudanças de formatação.

## Evidências de validação — 2026-10-08

- `pnpm --filter @nuagehub/standards exec vitest run src/cli/run.test.ts` — passou, 3 testes, código 0.
- `pnpm --filter @nuagehub/standards lint` — passou, código 0.
- `pnpm --filter @nuagehub/standards typecheck` — passou, código 0.
- `pnpm exec prettier --check packages/standards/src/cli/run.ts packages/standards/src/cli/run.test.ts` — passou, código 0.
- `pnpm build` — passou, código 0; `@nuagehub/web` e `@nuagehub/api` foram construídos sem `spawnSync pnpm ENOENT`.
- `git diff --exit-code -- index.html primeiros-passos.html plataformas.html playbook.html css js` — passou, código 0; nenhum arquivo do Site_Legado foi alterado.
- `pnpm --filter @nuagehub/standards test` — código 1 por falhas preexistentes fora do escopo: testes de commitlint/pre-write-security, caminho Windows em `commandsFor` e ausência de `uvx`; o teste `src/cli/run.test.ts` passou dentro da suíte.
