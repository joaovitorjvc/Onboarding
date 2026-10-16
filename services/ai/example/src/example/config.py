"""Configuração do módulo de IA obtida do ambiente."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Settings:
    """Configuração necessária para chamadas ao provedor externo."""

    api_key: str
    base_url: str
    timeout_seconds: float

    @classmethod
    def from_env(cls) -> Settings:
        """Lê as configurações e rejeita timeout inválido."""
        raw_timeout = os.getenv("AI_PROVIDER_TIMEOUT_SECONDS", "10")
        try:
            timeout_seconds = float(raw_timeout)
        except ValueError as error:
            raise ValueError("AI_PROVIDER_TIMEOUT_SECONDS deve ser um número positivo.") from error
        if timeout_seconds <= 0:
            raise ValueError("AI_PROVIDER_TIMEOUT_SECONDS deve ser um número positivo.")
        return cls(
            api_key=os.getenv("AI_PROVIDER_API_KEY", ""),
            base_url=os.getenv("AI_PROVIDER_BASE_URL", "https://api.example.invalid"),
            timeout_seconds=timeout_seconds,
        )
