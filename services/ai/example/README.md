# Módulo de IA de exemplo

Serviço FastAPI mínimo para integrações com provedores externos, com correlation ID, Formato_de_Erro compartilhado e logs JSON sem segredos.

```sh
uv sync
uv run uvicorn example.main:app --reload
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy --config-file ../../../mypy.ini src
```

Variáveis de ambiente:

- `AI_PROVIDER_API_KEY`: chave do provedor; nunca é registrada nos logs.
- `AI_PROVIDER_BASE_URL`: URL base do provedor.
- `AI_PROVIDER_TIMEOUT_SECONDS`: timeout positivo em segundos (padrão: `10`).
