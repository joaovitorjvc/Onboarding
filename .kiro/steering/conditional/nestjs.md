---
inclusion: fileMatch
fileMatchPattern: 'apps/api/**'
---

> Última alteração: 2026-10-08

# Padrões do App_API NestJS

- Escreva o App_API em TypeScript strict e organize-o por módulos de domínio, com controllers, services e DTOs em cada módulo.
- Nomeie arquivos em kebab-case com sufixo de artefato, como `checklist.controller.ts`, `checklist.service.ts` e `create-checklist.dto.ts`.
- Valide body, parâmetros e query contra DTOs antes da regra de negócio usando `ValidationPipe` com whitelist, proibição de campos desconhecidos e transformação tipada.
- Restrinja controllers ao mapeamento HTTP; mantenha regra de negócio em services e gere OpenAPI a partir de DTOs e controllers.
- Prefixe rotas com `/api/v1`; exija autenticação por padrão e marque explicitamente endpoints públicos com o mecanismo `@Public()`.
- Responda falhas de validação com 400 e `VALIDATION_FAILED`; responda exceções não tratadas com 500 e `INTERNAL_ERROR`, sem stack trace no corpo e com log estruturado.
- Leia configuração somente de variáveis de ambiente validadas na inicialização; encerre antes de escutar quando uma variável obrigatória estiver ausente ou inválida.
