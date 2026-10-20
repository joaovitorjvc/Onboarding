# ADR-0001: Registro de decisões arquiteturais

Última alteração: 2026-10-08 · Status: Aceito

## Contexto

O NuageHub precisa preservar decisões técnicas importantes de forma rastreável, independente da ferramenta usada para desenvolver o Monorepo. Sem um formato comum, decisões ficam dispersas em conversas, pull requests e arquivos temporários.

## Decisão

Adotar ADRs numerados em `docs/adr/`. Cada ADR deve conter título, data e status no cabeçalho, além das seções `Contexto`, `Decisão` e `Consequências`. A numeração deve ser única e crescente no repositório. Mudanças na Constituição exigem um novo ADR.

## Consequências

As decisões passam a ser consultáveis e revisáveis junto com o código. A manutenção exige reservar o próximo número disponível e atualizar o status quando uma decisão for substituída.
