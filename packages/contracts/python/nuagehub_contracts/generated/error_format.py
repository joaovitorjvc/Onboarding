# gerado por datamodel-codegen:
#   arquivo:  error-format.schema.json

from __future__ import annotations

from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class Detail(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    field: str
    issue: str


class ErrorFormat(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    code: Annotated[
        str,
        Field(description='Código estável do erro.', pattern='^[A-Z][A-Z0-9_]{2,63}$'),
    ]
    message: Annotated[
        str,
        Field(
            description='Mensagem em pt-BR, sem stack trace.',
            max_length=500,
            min_length=1,
        ),
    ]
    correlationId: Annotated[
        UUID, Field(description='Identificador de correlação (x-correlation-id).')
    ]
    status: Annotated[int, Field(description='Status HTTP.', ge=400, le=599)]
    details: Annotated[
        Optional[List[Detail]],
        Field(description='Detalhes por campo (erros de validação).'),
    ] = None
