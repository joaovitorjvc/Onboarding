"""Testes do Formato_de_Erro Python."""

from __future__ import annotations

import json
from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import UUID

from hypothesis import given, settings
from hypothesis import strategies as st
from nuagehub_contracts.error_format import ErrorFormat, parse, serialize
from scripts.generate import generate


@st.composite
def error_formats(draw: st.DrawFn) -> ErrorFormat:
    """Gera objetos válidos conforme as regras do schema JSON."""
    code = draw(st.from_regex(r"[A-Z][A-Z0-9_]{2,63}", fullmatch=True))
    message = draw(st.text(min_size=1, max_size=500))
    correlation_id = draw(st.uuids()).__str__()
    status = draw(st.integers(min_value=400, max_value=599))
    details = draw(
        st.one_of(
            st.none(),
            st.lists(
                st.fixed_dictionaries(
                    {
                        "field": st.text(),
                        "issue": st.text(),
                    }
                ),
                max_size=4,
            ),
        )
    )
    return ErrorFormat(
        code=code,
        message=message,
        correlationId=UUID(correlation_id),
        status=status,
        details=details,
    )


# Feature: project-standards, Property 22: Round-trip JSON do Formato_de_Erro
@settings(max_examples=100)
@given(error=error_formats())
def test_error_format_round_trip(error: ErrorFormat) -> None:
    parsed = parse(serialize(error))
    assert parsed == error
    assert "details" not in json.loads(serialize(error)) or error.details is not None


def test_generated_model_is_up_to_date() -> None:
    """Regenera em diretório temporário e compara com o artefato versionado."""
    generated_path = Path(__file__).parents[1] / "nuagehub_contracts" / "generated" / "error_format.py"
    with TemporaryDirectory() as temporary_directory:
        temporary_path = Path(temporary_directory) / "error_format.py"
        generate(temporary_path)
        assert temporary_path.read_text(encoding="utf-8") == generated_path.read_text(encoding="utf-8")
