---
inclusion: fileMatch
fileMatchPattern: 'services/ai/**'
---

> Última alteração: 2026-10-08

# Padrões dos Modulos_IA Python

- Use type hints em todas as funções públicas e valide o módulo com mypy, Ruff e formatação Ruff configurados na raiz.
- Use layout `src/{nome_do_modulo}/` e mantenha testes em `tests/`; nomeie módulos e funções em snake_case e classes em PascalCase.
- Quando exposto como serviço, publique contrato OpenAPI e faça o App_Web acessar o módulo somente por meio do App_API.
- Leia chaves e segredos de provedores exclusivamente de variáveis de ambiente; nunca os escreva no código ou nos logs.
- Aplique timeout configurável a chamadas externas e registre duração e resultado em log estruturado, sem dados sensíveis.
- Converta falha ou timeout do provedor em `AI_PROVIDER_ERROR` (502) ou `AI_PROVIDER_TIMEOUT` (504) no Formato_de_Erro compartilhado.
- Declare dependências no `pyproject.toml` do módulo e mantenha o lockfile Python correspondente versionado.
