"""Erros públicos do módulo de IA no Formato_de_Erro compartilhado."""

from __future__ import annotations

from uuid import UUID, uuid4

from nuagehub_contracts.generated.error_format import Detail, ErrorFormat


def build_error(
    code: str,
    message: str,
    status: int,
    correlation_id: str | None = None,
    details: list[Detail] | None = None,
) -> ErrorFormat:
    """Cria um erro validado, gerando correlation ID quando necessário."""
    parsed_correlation_id = uuid4() if correlation_id is None else UUID(correlation_id)
    return ErrorFormat(
        code=code,
        message=message,
        correlationId=parsed_correlation_id,
        status=status,
        details=details,
    )


class ProviderError(Exception):
    """Erro seguro e estruturado retornado por uma chamada ao provedor."""

    def __init__(self, error: ErrorFormat) -> None:
        super().__init__(error.message)
        self.error = error
