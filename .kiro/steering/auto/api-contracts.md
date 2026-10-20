---
inclusion: auto
name: api-contracts
description: Orienta contratos OpenAPI, tipos compartilhados e normalização do Formato_de_Erro.
---

> Última alteração: 2026-10-08

# Contratos de API

- Gere os tipos do App_Web e do App_API em `packages/contracts` a partir do OpenAPI exportado; não duplique DTOs ou o Formato_de_Erro em aplicações.
- Mantenha o JSON Schema em `packages/contracts/schemas/error-format.schema.json` como definição única, com `code`, `message`, `correlationId`, `status` e `details` opcional.
- Gere tipos TypeScript e o modelo Pydantic a partir das fontes do pacote; após alterar DTO ou controller, regenere os artefatos e confirme que não há diff pendente.
- Faça cada `details` representar um campo e uma issue; use `correlationId` UUID e não inclua stack trace ou segredo em `message`.
- Garanta round-trip JSON para todo objeto válido e converta payloads inválidos do cliente Web para `UNEXPECTED_ERROR`, preservando o status HTTP válido.
- Mapeie validação para `VALIDATION_FAILED`, autenticação para `UNAUTHENTICATED`, ausência para `NOT_FOUND`, falha interna para `INTERNAL_ERROR` e falhas de provedor para `AI_PROVIDER_ERROR` ou `AI_PROVIDER_TIMEOUT`.
- Ao alterar contrato, atualize consumidores, testes de propriedade e documentação OpenAPI na mesma alteração.
