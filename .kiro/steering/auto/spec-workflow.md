---
inclusion: auto
name: spec-workflow
description: Detalha como dimensionar, revisar e executar Specs e tarefas atômicas do NuageHub.
---

> Última alteração: 2026-10-08

# Fluxo detalhado de Specs

- Registre `**Estimativa_de_Esforco:** Nh` no cabeçalho do documento de requisitos e mantenha o nome da Spec em kebab-case.
- Para uma Spec_Simples, mantenha exatamente `requirements.md`, `design.md` e `tasks.md`. Para uma Spec_Epico, mantenha `epic-requirements.md`, `epic-design.md` e uma subpasta por Sub_Funcionalidade.
- Coloque requisitos legais, de compliance e regras globais no documento do épico; coloque arquitetura macro e modelo compartilhado no design do épico.
- Faça `requirements.md` e `design.md` de cada Sub_Funcionalidade apontarem por links relativos para os documentos do épico. Resolva conflitos no épico antes de implementar a subfuncionalidade.
- Escreva critérios em EARS e use termos do glossário; não transforme uma decisão de design em regra conflitante sem propor alteração aprovada da Constituição.
- Faça cada tarefa ter resultado verificável, uma única stack e até 8 h. Use o formato de sub-bullets `_Requirements: ..._`, `_Depends: ..._` e `_Stack: ... · Est: ...h_`.
- Trate itens de primeiro nível como agrupadores; somente tarefas atômicas entram no grafo. Não permita dependência inexistente ou ciclo.
- Apresente `requirements.md`, depois `design.md`, depois `tasks.md`, aguardando revisão do usuário entre documentos. Só então implemente e atualize as caixas das tarefas executadas.
