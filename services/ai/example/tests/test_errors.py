"""Testes dos handlers HTTP no Formato_de_Erro."""

import asyncio
import json
from typing import Any
from uuid import UUID, uuid4

from example.main import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from nuagehub_contracts.error_format import ErrorFormat, parse


def _request() -> Request:
    """Cria uma requisição mínima para testar handlers sem rota auxiliar."""
    scope: dict[str, Any] = {
        "type": "http",
        "method": "GET",
        "path": "/test",
        "headers": [],
        "query_string": b"",
        "scheme": "http",
        "server": ("test", 80),
        "client": ("test", 0),
    }
    request = Request(scope)
    request.state.correlation_id = uuid4()
    return request


def _error(response: JSONResponse) -> ErrorFormat:
    """Lê o corpo JSON de uma resposta do handler."""
    return parse(response.body.decode("utf-8"))


def test_validation_error_has_details_and_status_400() -> None:
    exception = RequestValidationError([{"loc": ("query", "value"), "msg": "Inteiro inválido.", "type": "int_parsing"}])
    response = asyncio.run(validation_exception_handler(_request(), exception))

    assert response.status_code == 400
    error = _error(response)
    assert error.code == "VALIDATION_FAILED"
    assert error.status == 400
    assert error.details
    UUID(str(error.correlationId))


def test_http_exception_preserves_status_and_code() -> None:
    response = asyncio.run(
        http_exception_handler(_request(), HTTPException(status_code=404, detail="Recurso não encontrado."))
    )

    assert response.status_code == 404
    error = _error(response)
    assert error.code == "NOT_FOUND"
    assert error.status == 404


def test_unhandled_exception_hides_internal_message() -> None:
    response = asyncio.run(
        unhandled_exception_handler(_request(), RuntimeError("detalhe interno não deve ser exposto"))
    )

    assert response.status_code == 500
    error = _error(response)
    assert error.code == "INTERNAL_ERROR"
    assert "detalhe interno" not in response.body.decode("utf-8")
    assert "detalhe interno" not in json.dumps(error.model_dump(mode="json"))
