---
inclusion: always
---

> Última alteração: 2026-10-08

# Estilo de Código

- Use UTF-8 e finais de linha LF; preserve a configuração versionada do `.editorconfig`.
- Use kebab-case para pastas e arquivos TypeScript que não sejam componentes; use snake_case para módulos e funções Python; use PascalCase para componentes React e classes Python.
- Mantenha componentes React em arquivos com o mesmo nome do componente e hooks customizados com prefixo `use` em camelCase.
- Use dois espaços em TypeScript, JSON, CSS, HTML e Markdown e quatro espaços em Python.
- Centralize as regras de formatação e lint na configuração versionada de cada linguagem; não crie regras locais concorrentes.
- Execute Prettier e ESLint nos arquivos TypeScript/Markdown/JSON do escopo e Ruff e mypy nos arquivos Python do escopo.
- Verifique a idempotência: formatar novamente um arquivo já formatado não pode produzir mudança.
