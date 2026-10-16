"""Configuração de logs estruturados do módulo de IA."""

from __future__ import annotations

import json
import logging
import sys
from typing import Any


class JsonFormatter(logging.Formatter):
    """Formata eventos de log como JSON compacto."""

    def format(self, record: logging.LogRecord) -> str:
        """Retorna somente campos estruturados e a mensagem segura do evento."""
        event: dict[str, Any] = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        for key in ("duration_ms", "result", "correlation_id"):
            if hasattr(record, key):
                event[key] = getattr(record, key)
        return json.dumps(event, ensure_ascii=False)


def configure_logging() -> logging.Logger:
    """Configura o logger do serviço uma única vez."""
    logger = logging.getLogger("example")
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    logger.propagate = False
    return logger
