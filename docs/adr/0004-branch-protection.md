# ADR-0004: Proteção da branch main

Última alteração: 2026-10-08 · Status: Aceito

## Contexto

A branch `main` deve receber somente alterações revisadas e verificadas pelo Pipeline_CI. A proteção não é um arquivo versionado do Monorepo: é uma configuração administrativa do GitHub.

## Decisão

Configurar manualmente, nas regras da branch `main` do repositório GitHub, os seguintes requisitos:

- pull request obrigatório;
- proibição de push direto;
- checks obrigatórios `ci / standards`, `ci / web`, `ci / api`, `ci / ai`, `ci / e2e` e `ci / coverage`;
- aprovação do Pipeline_CI antes do merge.

Como referência para a pessoa administradora, o comando equivalente é documentado abaixo. Ele deve ser revisado e executado manualmente, com `OWNER/REPOSITORY` substituídos pelo repositório correto:

```sh
gh api --method PUT repos/OWNER/REPOSITORY/branches/main/protection \\
  --field required_status_checks='{"strict":true,"contexts":["ci / standards","ci / web","ci / api","ci / ai","ci / e2e","ci / coverage"]}' \\
  --field enforce_admins=true \\
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \\
  --field restrictions=null
```

## Consequências

A configuração exige uma ação manual de administração do GitHub e não pode ser validada apenas por testes locais. Depois de aplicada, uma falha em qualquer check obrigatório bloqueia o merge e pushes diretos para `main` são rejeitados.
