---
inclusion: manual
---

> Última alteração: 2026-10-08

# Registro de ADR

Use este arquivo quando uma decisão alterar arquitetura, contrato, estrutura do monorepo, ferramenta ou regra canônica.

Crie `docs/adr/NNNN-descricao-curta.md` com este template:

```markdown
# ADR-NNNN: Título da decisão

Última alteração: AAAA-MM-DD · Status: Proposto|Aceito|Superado

## Contexto

Descreva o problema, as restrições e as alternativas consideradas.

## Decisão

Registre a alternativa escolhida e as regras que passam a valer.

## Consequências

Registre benefícios, custos, riscos e impactos operacionais.
```

- Numere o ADR sem reutilizar número existente e use nome em kebab-case.
- Vincule o ADR à Spec e aos documentos afetados quando aplicável.
- Ao alterar `.kiro/constitution.md`, inclua obrigatoriamente um ADR novo no mesmo pull request.
- Submeta o ADR para revisão do usuário antes de aplicar uma decisão que mude a Fonte_Canonica_de_Padroes.
