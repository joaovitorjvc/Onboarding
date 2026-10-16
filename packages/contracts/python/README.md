# nuagehub-contracts

Pacote Python com o Formato_de_Erro compartilhado pelo NuageHub. O modelo Pydantic v2 em `nuagehub_contracts/generated/error_format.py` é gerado a partir de `../schemas/error-format.schema.json`.

```sh
uv sync
uv run python scripts/generate.py
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy --config-file ../../../mypy.ini nuagehub_contracts
```

A geração exige `datamodel-code-generator` no grupo `dev`; o arquivo gerado não deve ser editado manualmente. `parse` valida JSON e `serialize` exclui campos opcionais nulos.
