"""Aplicação HTTP do módulo de IA de exemplo."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import cast
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from nuagehub_contracts.generated.error_format import Detail, ErrorFormat

from example.errors import build_error
from example.logging_setup import configure_logging

app = FastAPI(title="NuageHub AI Example", version="0.1.0")
logger = configure_logging()


def _request_correlation_id(request: Request) -> str:
    """Obtém o correlation ID normalizado pelo middleware."""
    return str(getattr(request.state, "correlation_id", uuid4()))


def _content(error: ErrorFormat) -> dict[str, object]:
    """Converte o modelo em conteúdo JSON sem campos opcionais nulos."""
    return cast(dict[str, object], error.model_dump(mode="json", exclude_none=True))


@app.middleware("http")
async def correlation_id_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    """Preserva ou cria x-correlation-id para cada resposta."""
    raw_correlation_id = request.headers.get("x-correlation-id")
    try:
        correlation_id = UUID(raw_correlation_id) if raw_correlation_id else uuid4()
    except ValueError:
        correlation_id = uuid4()
    request.state.correlation_id = correlation_id
    response = await call_next(request)
    response.headers["x-correlation-id"] = str(correlation_id)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Retorna uma issue por campo para entradas inválidas."""
    details = [
        Detail(
            field=".".join(str(part) for part in error.get("loc", ())) or "request",
            issue=str(error.get("msg", "Entrada inválida.")),
        )
        for error in exc.errors()
    ]
    error = build_error(
        "VALIDATION_FAILED",
        "A requisição contém dados inválidos.",
        400,
        _request_correlation_id(request),
        details,
    )
    return JSONResponse(status_code=400, content=_content(error))


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Mapeia HTTPException para código estável e status original."""
    code_by_status = {400: "VALIDATION_FAILED", 401: "UNAUTHENTICATED", 404: "NOT_FOUND"}
    code = code_by_status.get(exc.status_code, "HTTP_ERROR")
    message = str(exc.detail) if isinstance(exc.detail, str) else "A requisição não pôde ser atendida."
    error = build_error(code, message[:500] or "Erro HTTP.", exc.status_code, _request_correlation_id(request))
    return JSONResponse(status_code=exc.status_code, content=_content(error))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Oculta detalhes internos e registra apenas evento seguro."""
    del exc
    correlation_id = _request_correlation_id(request)
    logger.error("unhandled_exception", extra={"result": "error", "correlation_id": correlation_id})
    error = build_error(
        "INTERNAL_ERROR",
        "Ocorreu um erro interno. Tente novamente.",
        500,
        correlation_id,
    )
    return JSONResponse(status_code=500, content=_content(error))


@app.get("/health")
async def health() -> dict[str, str]:
    """Endpoint público de verificação de saúde."""
    return {"status": "ok"}
