---
inclusion: always
---

> Última alteração: 2026-10-20

# Estrutura do Repositório

- Coloque código do frontend em `apps/web`, código do backend em `apps/api`, módulos Python em `services/ai/{nome-do-modulo}` e reutilização compartilhada em `packages/`.
- Mantenha os arquivos de governança em `.kiro/`, com `constitution.md`, `agents/nuagehub.json`, `settings/cli.json`, `specs/` e `steering/`.
- Use `CLAUDE.md`, `.claude/` e `scripts/hooks/` como pontos de integração dos agentes; o Agente_de_Projeto_Kiro é `.kiro/agents/nuagehub.json`.
- Dê a cada aplicação e Modulo_IA um README com propósito, execução, testes e variáveis de ambiente.
- Mantenha um único workspace JavaScript com `pnpm-workspace.yaml` e um único `pnpm-lock.yaml` na raiz; cada módulo Python deve possuir `pyproject.toml` e lockfile próprios.
- Não recrie páginas HTML, `css/` ou `js/` na raiz; o portal é servido pelo App_Web desde a conclusão da Spec `legacy-migration` (ADR-0005).
