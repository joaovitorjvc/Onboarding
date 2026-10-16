"""Cliente resiliente para um provedor externo de IA."""

from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Mapping
from typing import Protocol
from uuid import UUID, uuid4

import httpx

from example.config import Settings
from example.errors import ProviderError, build_error
from example.logging_setup import configure_logging


class ProviderTransport(Protocol):
    """Transporte assíncrono injetável para chamadas ao provedor."""

    async def send(
        self,
        payload: Mapping[str, object] | None,
        base_url: str,
        api_key: str,
        timeout_seconds: float,
    ) -> object:
        """Envia o payload e retorna a resposta do provedor."""


class HttpxProviderTransport:
    """Transporte HTTP padrão baseado em httpx."""

    async def send(
        self,
        payload: Mapping[str, object] | None,
        base_url: str,
        api_key: str,
        timeout_seconds: float,
    ) -> object:
        """Executa uma requisição sem expor a chave em logs."""
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.post(
                base_url,
                json=payload,
                headers={"Authorization": f"Bearer {api_key}"},
            )
            response.raise_for_status()
            return response.json()


class ProviderClient:
    """Cliente que normaliza falhas do provedor no Formato_de_Erro."""

    def __init__(
        self,
        settings: Settings | None = None,
        transport: ProviderTransport | None = None,
        logger: logging.Logger | None = None,
    ) -> None:
        self.settings = settings or Settings.from_env()
        self.transport = transport or HttpxProviderTransport()
        self.logger = logger or configure_logging()

    async def request(
        self,
        payload: Mapping[str, object] | None = None,
        correlation_id: UUID | None = None,
    ) -> object:
        """Chama o provedor e mapeia timeout e falha para erros públicos."""
        request_correlation_id = correlation_id or uuid4()
        started_at = time.perf_counter()
        try:
            result = await asyncio.wait_for(
                self.transport.send(
                    payload,
                    self.settings.base_url,
                    self.settings.api_key,
                    self.settings.timeout_seconds,
                ),
                timeout=self.settings.timeout_seconds,
            )
        except (TimeoutError, httpx.TimeoutException) as error:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self.logger.warning(
                "provider_request",
                extra={
                    "duration_ms": duration_ms,
                    "result": "timeout",
                    "correlation_id": str(request_correlation_id),
                },
            )
            raise ProviderError(
                build_error(
                    "AI_PROVIDER_TIMEOUT",
                    "O provedor de IA excedeu o tempo limite.",
                    504,
                    str(request_correlation_id),
                )
            ) from error
        except Exception as error:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self.logger.error(
                "provider_request",
                extra={
                    "duration_ms": duration_ms,
                    "result": "error",
                    "correlation_id": str(request_correlation_id),
                },
            )
            raise ProviderError(
                build_error(
                    "AI_PROVIDER_ERROR",
                    "O provedor de IA está indisponível.",
                    502,
                    str(request_correlation_id),
                )
            ) from error

        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        self.logger.info(
            "provider_request",
            extra={
                "duration_ms": duration_ms,
                "result": "success",
                "correlation_id": str(request_correlation_id),
            },
        )
        return result

    async def call(
        self,
        payload: Mapping[str, object] | None = None,
        correlation_id: UUID | None = None,
    ) -> object:
        """Alias semântico para request, preservando uma API simples."""
        return await self.request(payload, correlation_id)
