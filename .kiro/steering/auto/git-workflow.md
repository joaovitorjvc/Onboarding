---
inclusion: auto
name: git-workflow
description: Detalha commits, branches, pull requests e verificações exigidas no fluxo Git.
---

> Última alteração: 2026-10-08

# Fluxo Git detalhado

- Escreva mensagens no formato Conventional Commits `tipo(escopo): descrição`, com escopo não vazio e pertencente à área alterada.
- Use os tipos e escopos configurados pelo repositório; prefira `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf` ou `build` e escopos como `web`, `api`, `ai`, `contracts`, `standards`, `config`, `ci`, `docs` e `deps`.
- Crie branches a partir de `main` no formato `{tipo}/{descricao-curta}`, usando somente letras minúsculas, números e hífens na descrição.
- Abra pull request com resumo, link para a Spec, testes executados e justificativa de dependências novas; aguarde o Pipeline_CI aprovado.
- Antes de propor integração, rode padrões, segurança, lint, typecheck e testes das stacks afetadas e informe qualquer falha.
- Ao modificar a Constituição, inclua um novo ADR numerado em `docs/adr/` que explique contexto, decisão e consequências.
