"""Testes baseados em propriedades do cliente de provedor."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Mapping
from string import ascii_letters, digits

from example.config import Settings
from example.errors import ProviderError
from example.provider_client import ProviderClient
from hypothesis import given, settings
from hypothesis import strategies as st


class FakeTransport:
    """Transporte determinístico para os três desfechos do provedor."""

    def __init__(self, outcome: str, secret: str) -> None:
        self.outcome = outcome
        self.secret = secret

    async def send(
        self,
        payload: Mapping[str, object] | None,
        base_url: str,
        api_key: str,
        timeout_seconds: float,
    ) -> object:
        del payload, base_url, api_key
        if self.outcome == "timeout":
            await asyncio.sleep(timeout_seconds * 10)
        if self.outcome == "failure":
            raise RuntimeError(f"falha privada: {self.secret}")
        return {"ok": True}


class ListHandler(logging.Handler):
    """Captura mensagens sem depender do formato do console."""

    def __init__(self) -> None:
        super().__init__()
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.messages.append(record.getMessage())


# Feature: project-standards, Property 20: Cliente de provedor de IA: falhas tipadas e logs sem segredos
@settings(max_examples=100)
@given(
    secret=st.text(alphabet=ascii_letters + digits, min_size=16, max_size=80),
    outcome=st.sampled_from(["success", "failure", "timeout"]),
)
def test_provider_outcomes_are_typed_and_logs_never_contain_secret(secret: str, outcome: str) -> None:
    async def run() -> None:
        handler = ListHandler()
        logger = logging.getLogger("property-provider")
        logger.handlers.clear()
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        client = ProviderClient(
            settings=Settings(
                api_key=secret,
                base_url="https://provider.invalid",
                timeout_seconds=0.001,
            ),
            transport=FakeTransport(outcome, secret),
            logger=logger,
        )

        if outcome == "success":
            assert await client.request() == {"ok": True}
        else:
            try:
                await client.request()
            except ProviderError as error:
                expected_code = "AI_PROVIDER_TIMEOUT" if outcome == "timeout" else "AI_PROVIDER_ERROR"
                expected_status = 504 if outcome == "timeout" else 502
                assert error.error.code == expected_code
                assert error.error.status == expected_status
            else:
                raise AssertionError("O desfecho de erro deveria gerar ProviderError.")

        assert secret not in " ".join(handler.messages)
        assert handler.messages

    asyncio.run(run())
