"""Testes do endpoint de saúde."""

from example.main import app
from fastapi.testclient import TestClient


def test_health_returns_ok_and_correlation_id() -> None:
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["x-correlation-id"]
