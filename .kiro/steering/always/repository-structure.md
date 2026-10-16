---
inclusion: always
---

> Última alteração: 2026-10-08

# Estrutura do Repositório

- Coloque código do frontend em `apps/web`, código do backend em `apps/api`, módulos Python em `services/ai/{nome-do-modulo}` e reutilização compartilhada em `packages/`.
- Mantenha os arquivos de governança em `.kiro/`, com `constitution.md`, `agents/nuagehub.json`, `settings/cli.json`, `specs/` e `steering/`.
- Use `CLAUDE.md`, `.claude/` e `scripts/hooks/` como pontos de integração dos agentes; o Agente_de_Projeto_Kiro é `.kiro/agents/nuagehub.json`.
- Dê a cada aplicação e Modulo_IA um README com propósito, execução, testes e variáveis de ambiente.
- Mantenha um único workspace JavaScript com `pnpm-workspace.yaml` e um único `pnpm-lock.yaml` na raiz; cada módulo Python deve possuir `pyproject.toml` e lockfile próprios.
- Considere `index.html`, `primeiros-passos.html`, `plataformas.html`, `playbook.html`, `css/**` e `js/**` como Site_Legado. Não os edite, formate, migre ou inclua nas verificações de stack.
- Se uma implementação exigir alteração do Site_Legado, registre a pendência para a Spec `legacy-migration` e mantenha os arquivos originais intactos.
