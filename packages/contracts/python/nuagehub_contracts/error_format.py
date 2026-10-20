"""Serialização e validação do Formato_de_Erro compartilhado."""

from __future__ import annotations

from typing import Final

from pydantic import TypeAdapter

from nuagehub_contracts.generated.error_format import ErrorFormat

_ERROR_FORMAT_ADAPTER: Final[TypeAdapter[ErrorFormat]] = TypeAdapter(ErrorFormat)


def parse(json_str: str) -> ErrorFormat:
    """Valida JSON e retorna um Formato_de_Erro tipado."""
    return _ERROR_FORMAT_ADAPTER.validate_json(json_str)


def serialize(err: ErrorFormat) -> str:
    """Serializa um erro sem incluir campos opcionais nulos."""
    return err.model_dump_json(exclude_none=True)


__all__ = ["ErrorFormat", "parse", "serialize"]
